const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User, Category, Session, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { parseUserAgent } = require('../utils/deviceParser');
const { generateToken, verifyToken } = require('../services/authService');
const { addToBlacklist, isBlacklisted } = require('../services/blacklistService');
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

            // 生成盐值并哈希密码
            const salt = crypto.randomBytes(16).toString('hex');
            const passwordHash = await bcrypt.hash(password + salt, 10);

            // 创建新用户
            const newUser = await User.create({
                username,
                email,
                passwordHash,
                salt,
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

            // 生成JWT令牌
            const token = generateToken(newUser.id, newUser.role); // 默认角色为'user'

            return createSuccessResponse(res, 201, 'User registered successfully', {
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                },
                token
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Error during registration:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 用户登录
    async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return createFailResponse(res, 400, 'Validation failed', errors.array());
            }

            const { username, password, twoFactorCode } = req.body;

            // 查找用户
            const user = await User.findOne({
                where: {
                    // 支持用户名或邮箱登录
                    [Op.or]: [{ username }, { email: username }]
                }
            });

            if (!user) {
                // 即使没有找到用户，也可以记录一个通用的失败日志，用于监控异常的登录尝试
                await logSecurityEvent(null, 'login_failed', {
                    attemptedUsername: username,
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    reason: 'user_not_found'
                })
                return createFailResponse(res, 401, 'Invalid username or email');
            }

            // 检查用户是否被锁定 (例如，多次登录失败后)
            if (user.lockedUntil && user.lockedUntil > new Date()) {
                return createFailResponse(res, 423, 'Account is temporarily locked');
            }

            // 验证密码
            const isPasswordValid = await bcrypt.compare(password + user.salt, user.passwordHash);

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
                    });
                    return createFailResponse(res, 423, 'Account locked due to multiple failed login attempts');
                }

                // 记录登录失败的安全日志
                await logSecurityEvent(user.id, 'login_failed', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    reason: 'invalid_password'
                });

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
            });

            // 生成JWT令牌并返回用户信息
            const token = generateToken(user.id, user.role);
            const decoded = jwt.decode(token); // 解码JWT以获取用户信息, 包含jti和exp

            // 记录会话信息
            const deviceInfo = parseUserAgent(req.get('User-Agent')); // 解析用户代理字符串以获取设备信息
            await Session.create({
                userId: user.id,
                jti: decoded.jti,
                deviceInfo,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                expiresAt: new Date(decoded.exp * 1000) // 将JWT的过期时间转换为毫秒并设置为会话记录的过期时间
            })


            // 记录登录成功的安全日志
            await logSecurityEvent(user.id, 'login', {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            return createSuccessResponse(res, 200, 'Login successful', {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    twoFactorEnabled: user.twoFactorEnabled // 返回双因素认证状态信息，以便前端可以据此显示或隐藏相关UI元素
                },
                token // 前端通过npm install jwt-decode可以解析出jti和exp等信息，供前端显示会话活动信息，例如会话过期时间, 是否是当前设备。
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
            const token = req.token; // 从请求对象中获取JWT令牌
            const tokenJti = req.tokenJti; // 从请求对象中获取令牌的jti值，用于在黑名单中查找和删除该令牌

            delete req.user; // 删除请求对象中的JWT令牌
            delete req.tokenJti; // 删除请求对象中的令牌jti值

            const currentSession = await Session.findOne({
                where: {
                    userId,
                    jti: tokenJti
                }
            });

            if (currentSession) {
                await currentSession.update({ isActive: false });
            }

            const decoded = verifyToken(token);
            if (!decoded) {
                return createSuccessResponse(res, 200, 'Logout successful (token was already invalid).');
            }

            // 计算令牌剩余的有效时间（秒）
            const now = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
            const expiresIn = decoded.exp - now;

            if (expiresIn > 0) {
                // 将令牌添加到黑名单，并设置过期时间等于剩余的有效时间，这样可以确保在令牌完全失效之前阻止其使用。
                await addToBlacklist(token, expiresIn);
            }

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
            const { id: userId } = req.user;
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return createFailResponse(res, 401, 'Access token required for refresh');
            }

            const token = authHeader.split(' ')[1]; // 从授权令牌中提取实际的JWT字符串（假设格式为"Bearer <token>"）
            const decoded = verifyToken(token); // 验证JWT令牌的有效性并获取其内容
            if (!decoded) {
                return createFailResponse(res, 401, 'Invalid or expired token for refresh');
            }

            const isInBlacklist = await isBlacklisted(token);
            if (isInBlacklist) {
                return createFailResponse(res, 401, 'Token has been revoked, please login again');
            }

            const user = await User.findByPk(userId);
            if (!user || !user.isActive) {
                return createFailResponse(res, 401, 'User not found or inactive');
            }

            const now = Math.floor(Date.now() / 1000);
            const expiresIn = decoded.exp - now;
            if (expiresIn > 0) {
                await addToBlacklist(token, expiresIn);
            }

            // 生成一个新的JWT令牌并返回给客户端。
            const newToken = generateToken(userId, user.role);

            return createSuccessResponse(res, 200, 'Token refreshed successfully', {
                token: newToken
            });
        } catch (error) {
            console.error('Error during refreshing token:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },
}

module.exports = authController;