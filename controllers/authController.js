const bcrypt = require('bcrypt');
const { User, Category, Session, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { parseUserAgent } = require('../utils/deviceParser');
const { generateTokenPair } = require('../services/authService');
const { createSuccessResponse, createFailResponse } = require('../utils/response');
const { logSecurityEvent } = require('../utils/logger');
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

            await transaction.commit(); // 提交事务

            // 记录安全日志
            await logSecurityEvent(newUser.id, 'account_created', {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

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

            // 验证密码是否正确
            const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);

            if (!isPasswordValid) {
                // 增加登录失败次数
                await user.increment('failedLoginAttempts');

                // 如果登录失败次数超过阈值，锁定账户
                if (user.failedLoginAttempts >= 5) { // 阈值为5次
                    const lockTime = new Date(); // 锁定时间设置为当前时间
                    lockTime.setMinutes(lockTime.getMinutes() + 1); // 加锁时间设置为当前时间的一分钟后
                    await user.update({ lockedUntil: lockTime }); // 更新锁定时间

                    // 记录登录失败的安全日志
                    await logSecurityEvent(user.id, 'account_locked', {
                        ip: req.ip,
                        userAgent: req.get('User-Agent')
                    }, null, transaction);
                    return createFailResponse(res, 423, 'Account locked due to multiple failed login attempts');
                }

                // 记录登录失败的安全日志
                await logSecurityEvent(user.id, 'login_failed', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    reason: 'invalid_password'
                }, null, transaction);

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

            // 如果登录成功，重置失败次数和锁定状态并记录最后登录时间
            await user.update({
                failedLoginAttempts: 0,
                lockedUntil: null, // 解锁账户
                lastLogin: new Date() // 记录最后登录时间
            }, { transaction });

            // 生成JWT令牌对，包含访问令牌和刷新令牌
            const { accessToken, refreshToken } = generateTokenPair(user);

            // 将刷新令牌哈希存储在用户记录中，以便后续可以验证刷新令牌
            user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
            await user.save({ transaction });

            const decoded = jwt.decode(accessToken); // 解码JWT以获取过期时间等信息

            // 记录会话信息
            const deviceInfo = parseUserAgent(req.get('User-Agent')); // 解析用户代理字符串以获取设备信息
            await Session.create({
                userId: user.id,
                deviceInfo,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                expiresAt: new Date(decoded.exp * 1000) // 将JWT的过期时间转换为毫秒并设置为会话记录的过期时间
            }, { transaction })


            // 记录登录成功的安全日志
            await logSecurityEvent(user.id, 'login', {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            }, null, transaction);

            // 提交事务
            await transaction.commit();

            return createSuccessResponse(res, 200, 'Login successful', {
                user,
                accessToken,
                refreshToken
            });
        } catch (error) {
            console.error('Error during login:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 用户登出
    async logout(req, res) {
        try {
            const userId = req.user.id; // 从请求对象中获取用户ID

            // 这里应该使JWT令牌失效，但由于JWT是无状态的，我们需要使用Redis的黑名单机制来阻止旧的令牌被再次使用。
            // const token = req.token; // 从请求对象中获取JWT令牌

            // delete req.user; // 清除请求对象中的用户信息

            // const decoded = verifyToken(token);
            // if (!decoded) {
            //     return createSuccessResponse(res, 200, 'Logout successful (token was already invalid).');
            // }

            // 记录登出成功的安全日志
            await logSecurityEvent(userId, 'logout', {
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

            // const { id: userId } = req.user;
            const { refreshToken } = req.body;

            // const user = await User.findByPk(userId);
            // if (!user || !user.isActive) {
            //     return createFailResponse(res, 401, 'User not found or inactive');
            // }

            // 使用模型中自定义方法查找用户
            const user = await User.findByRefreshToken(refreshToken);
            if (!user) {
                return createFailResponse(res, 401, 'Invalid or expired refresh token');
            }

            // 生成新的令牌对
            const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);

            // 更新用户的刷新令牌哈希
            const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
            await user.update({
                refreshTokenHash: newRefreshTokenHash
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