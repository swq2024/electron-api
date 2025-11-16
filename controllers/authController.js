const bcrypt = require('bcrypt');
const { User, Category, Session, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { parseUserAgent } = require('../utils/deviceParser');
const { generateTokenPair, verifyToken, decodeToken } = require('../services/authService');
const { createSuccessResponse, createFailResponse } = require('../utils/response');
const { logSecurityEvent } = require('../utils/logger');
const { addToBlacklist, isBlacklisted } = require('../services/blacklistService');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

const authController = {
    // 用户注册
    async register(req, res) {
        // 开启事务支持
        const transaction = await sequelize.transaction();
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                await transaction.rollback();
                return createSuccessResponse(res, 400, 'Validation failed', errors.array());
            }

            const { username, email, password, masterPasswordHint } = req.body;

            // 检查用户名或邮箱是否存在
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [{ username }, { email }]
                },
            }, { transaction });

            if (existingUser) {
                await transaction.rollback();
                return createFailResponse(res, 409, 'Username or email already exists');
            }

            // 创建新用户
            const newUser = await User.create({
                username,
                email,
                passwordHash: password,
                tokenVersion: 1,
                refreshTokenHash: null,
                masterPasswordHint
            }, { transaction });

            // 为新用户创建默认分类(相当于密码记录的初始容器)
            await Category.create({
                userId: newUser.id,
                name: 'General',
                color: '#95a5a6',
                icon: 'folder',
                isDefault: true // 设置为默认分类 默认 false
            }, { transaction })

            // 记录安全日志
            await logSecurityEvent(newUser.id, 'account_created', {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            }, null, transaction);

            await transaction.commit(); // 提交事务

            return createSuccessResponse(res, 201, 'User registered successfully. Please log in.');
        } catch (error) {
            await transaction.rollback();
            console.error('Error during registration:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 用户登录
    async login(req, res) {
        // 开启事务支持
        const transaction = await sequelize.transaction();
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return createFailResponse(res, 400, 'Validation failed', errors.array());
            }

            const { username, password, twoFactorCode } = req.body;

            // 查找用户, 限定scope为'withHashes', 这样可以直接访问passwordHash等hash字段
            const user = await User.scope('withHashes').findOne({
                where: {
                    // 支持用户名或邮箱登录
                    [Op.or]: [{ username }, { email: username }]
                },
            }, { transaction });


            if (!user) {
                return createFailResponse(res, 401, 'Invalid username or email');
            }

            // 检查用户是否被锁定 (例如，多次登录失败后)
            if (user.lockedUntil && user.lockedUntil > new Date()) {
                return createFailResponse(res, 423, 'Account is temporarily locked');
            }

            // 检查用户是否激活
            if (!user.isActive) {
                return createFailResponse(res, 401, 'Account is inactive');
            }

            // 验证密码是否正确
            const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);

            if (!isPasswordValid) {
                // 增加登录失败次数
                await user.increment('failedLoginAttempts');

                // 如果登录失败次数超过阈值，锁定账户
                if (user.failedLoginAttempts >= 5) { // 阈值为5次
                    const lockTime = new Date();
                    // 锁定1分钟
                    lockTime.setMinutes(lockTime.getMinutes() + 1);
                    // 更新锁定时间
                    await user.update({
                        lockedUntil: lockTime
                    });

                    // 记录登录失败的安全日志
                    await logSecurityEvent(user.id, 'account_locked', {
                        ip: req.ip,
                        userAgent: req.get('User-Agent')
                    });
                    return createFailResponse(res, 423, 'Account locked due to multiple failed login attempts');
                }

                return createFailResponse(res, 401, 'Invalid username or password');
            }

            // 检查用户是否启用了双因素认证
            if (user.twoFactorEnabled) {
                if (!twoFactorCode) {
                    return createFailResponse(res, 401, 'Two-factor code is required for this account');
                }

                // TODO: 实现双因素认证验证逻辑
                // const isTwoFactorValid = verifyTwoFactorCode(user.twoFactorSecret, twoFactorCode); // 假设有一个函数用于验证双因素认证码
                // if (!isTwoFactorValid) {
                //     return createFailResponse(res, 401, 'Invalid two-factor authentication code');
                // }
            }

            // 重置登录失败次数和锁定状态，并记录最后登录时间
            if (user.failedLoginAttempts > 0) {
                await user.update({
                    failedLoginAttempts: 0,
                    lockedUntil: null, // 解锁账户
                    lastLogin: new Date() // 记录最后登录时间
                }, { transaction });
            }
            // 生成JWT令牌对，包含访问令牌和刷新令牌
            const { accessToken, refreshToken } = generateTokenPair(user);

            // 将刷新令牌哈希存储在用户记录中，以便后续可以验证刷新令牌
            const newRefreshTokenHash = await bcrypt.hash(refreshToken, 10);
            await user.update({
                refreshTokenHash: newRefreshTokenHash
            }, { transaction });

            // 解码JWT以获取过期时间等信息
            const decoded = jwt.decode(accessToken);

            const atExpiresAt = new Date(decoded.exp * 1000);

            // 手动为刷新令牌设置过期时间，设置为7天
            const rtExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            // 记录会话信息
            const deviceInfo = parseUserAgent(req.get('User-Agent')); // 解析用户代理字符串以获取设备信息
            const existingSession = await Session.findOne({
                where: {
                    userId: user.id,
                    deviceInfo: {
                        [Op.substring]: deviceInfo.deviceFingerprint // 查找当前设备指纹匹配的会话
                    }
                }
            });

            // 如果当前会话不存在，则创建一个新会话，保证同一设备，只保留一个有效的会话记录
            if (!existingSession) {
                await Session.create({
                    userId: user.id,
                    jti: JSON.stringify({
                        at: decoded.jti, // AT的jti
                        rt: refreshToken // RT本身就是一个UUID, 它的jti就是它自己
                    }),
                    deviceInfo,
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                    expiresAt: atExpiresAt,
                    rtExpiresAt: rtExpiresAt
                }, { transaction })
                // 记录登录成功的安全日志
                await logSecurityEvent(user.id, 'login', {
                    reason: 'successful login[first login]',
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                }, null, transaction);
            } else {
                // 如果当前会话已存在，更新会话信息
                await existingSession.update({
                    expiresAt: atExpiresAt,
                    rtExpiresAt: rtExpiresAt,
                    isActive: true, // 标记为活跃状态(被当前用户在当前设备上主动登出后又重新登录了])
                    jti: JSON.stringify({
                        at: decoded.jti, // AT的jti
                        rt: refreshToken // RT本身就是一个UUID, 它的jti就是它自己
                    })
                }, { transaction })
            }

            // 提交事务
            await transaction.commit();

            return createSuccessResponse(res, 200, 'Login successful', {
                user,
                accessToken,
                refreshToken
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Error during login:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 用户登出
    async logout(req, res) {
        try {
            const userId = req.user.id;
            const currentAT = req.token; // AT

            const decode = verifyToken(currentAT);
            if (!decode) {
                return createFailResponse(res, 200, 'Logout successful(token was already invalid)');
            }

            const currentSession = await Session.findOne({
                where: {
                    userId,
                    isActive: true
                }
            })

            if (!currentSession) {
                return createFailResponse(res, 200, 'Logout successful(no active session found)');
            }

            // 从会话记录中解析出双jti
            let jtiObj;
            try {
                jtiObj = JSON.parse(currentSession.jti);
            } catch (e) {
                console.error('Fail to parse jti from session', e);
                createFailResponse(res, 500, 'Internal server error: corrupted session data');
            }

            // 计算AT和RT的剩余有效时间
            const now = Math.floor(Date.now() / 1000);
            const atExpiresIn = decode.exp - now;
            const rtExpiresIn = Math.floor((new Date(currentSession.rtExpiresAt).getTime() / 1000)) - now;

            // 将AT的jti加入黑名单
            if (atExpiresIn > 0) {
                await addToBlacklist(jtiObj.at, atExpiresIn);
                console.log(`Access token ${jtiObj.at} added to blacklist with TTL ${atExpiresIn}s.`);
            }
            // 将RT的jti加入黑名单
            if (jtiObj.rt && rtExpiresIn > 0) {
                await addToBlacklist(jtiObj.rt, rtExpiresIn);
                console.log(`Refresh token ${jtiObj.rt} added to blacklist with TTL ${rtExpiresIn}s.`);
            }
            // 更新会话状态为非活动状态
            await currentSession.update({
                isActive: false
            });

            // 记录登出成功的安全日志
            await logSecurityEvent(userId, 'logout', {
                reason: 'User requested logout',
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            return createSuccessResponse(res, 200, 'Logout successful');
        } catch (error) {
            console.error('Error during logout:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 刷新JWT令牌
    async refreshToken(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return createFailResponse(res, 400, 'Validation failed', errors.array());
            }

            const { refreshToken } = req.body;

            const isInBlacklisted = await isBlacklisted(refreshToken);
            if (isInBlacklisted) {
                return createFailResponse(res, 401, 'Invalid or expired refresh token (blacklisted)');
            }

            // 使用模型中自定义方法查找用户
            const user = await User.findByRefreshToken(refreshToken);

            if (!user) {
                return createFailResponse(res, 401, 'Invalid or expired refresh token');
            }

            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return createFailResponse(res, 401, 'Refresh token endpoint requires an expired access token');
            }
            const oldAccessToken = authHeader.substring(7);
            const decodeOldAT = decodeToken(oldAccessToken);

            if (!decodeOldAT) {
                return createFailResponse(res, 401, 'The provided access token is malformed');
            }

            // 查找并验证旧的会话记录
            const oldSession = await Session.findOne({
                where: {
                    userId: decodeOldAT.payload.userId, // 确保RT属于正确的用户
                }
            })

            if (!oldSession) {
                return createFailResponse(res, 401, 'No active session found for this user.');
            }

            // 从旧的会话记录的jti字段中解析出旧的RT
            let jtiObj;
            try {
                jtiObj = JSON.parse(oldSession.jti);
            } catch (e) {
                return createFailResponse(res, 401, 'Internal server error: corrupted session data');
            }
            
            if (jtiObj.rt !== refreshToken) {
                return createFailResponse(res, 401, 'Invalid refresh token');
            }
            if (!oldSession.isActive || oldSession.rtExpiresAt < new Date()) {
                return createFailResponse(res, 401, 'Session is inactive or expired.');
            }

            // 计算RT的剩余有效时间，并将其加入黑名单。
            // 刷新令牌接口只需要将旧的RT加入黑名单即可，无需处理AT。因为旧的AT已经失效所以才来请求这个接口。
            const now = Math.floor(Date.now() / 1000);
            const oldRTExpiresIn = Math.floor((new Date(oldSession.rtExpiresAt).getTime() / 1000)) - now;

            if (oldRTExpiresIn > 0) {
                await addToBlacklist(jtiObj.rt, oldRTExpiresIn);
            }

            // 生成新的令牌对
            const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user.dataValues);

            // 解码新令牌
            const decodeNewAT = decodeToken(accessToken);

            // 更新会话记录
            await oldSession.update({
                jti: JSON.stringify({
                    at: decodeNewAT.payload.jti,
                    rt: newRefreshToken
                }),
                expiresAt: new Date(decodeNewAT.payload.exp * 1000),
                rtExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            })

            // 更新用户的刷新令牌哈希
            const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
            await user.update({
                refreshTokenHash: newRefreshTokenHash
            });

            // 记录刷新令牌的安全日志
            await logSecurityEvent(user.dataValues.id, 'token_refreshed', {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            return createSuccessResponse(res, 200, 'Token refreshed successfully', {
                accessToken,
                refreshToken: newRefreshToken
            });
        } catch (error) {
            console.error('Error during refreshing token:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },
}

module.exports = authController;