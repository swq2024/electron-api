const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User } = require('../models');
const { validationResult } = require('express-validator');
const { generateToken, verifyToken } = require('../services/authService');
const { addToBlacklist } = require('../services/blacklistService');
const { createSuccessResponse, createFailResponse } = require('../utils/response');
const { logSecurityEvent } = require('../utils/logger');
const { Op } = require('sequelize');

const authController = {
    // 用户注册
    async register(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return createSuccessResponse(res, 400, 'Validation failed', errors.array());
            }

            const { username, email, password, masterPasswordHint } = req.body;

            // 检查用户名或邮箱是否存在
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [{ username }, { email }]
                }
            });

            if (existingUser) {
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
            });

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
            console.error('Error during registration:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 用户登录
    async login(req, res) {
        try {
            const errors = validationResult(req); // 验证请求体中的数据
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

            // 记录登录成功的安全日志
            await logSecurityEvent(user.id, 'login', {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            // 生成JWT令牌并返回用户信息
            const token = generateToken(user.id, user.role);
            return createSuccessResponse(res, 200, 'Login successful', {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    twoFactorEnabled: user.twoFactorEnabled // 返回双因素认证状态信息，以便前端可以据此显示或隐藏相关UI元素
                },
                token
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
            if (!token) {
                return createFailResponse(res, 400, 'No token provided for logout operation');
            }

            const decoded = verifyToken(token); // 验证JWT令牌的有效性
            if (!decoded) {
                // 令牌已经无效，直接返回成功
                return createSuccessResponse(res, 200, 'Logout successful (token was already invalid)');
            }

            // 计算令牌剩余的有效时间（秒）
            const now = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
            const expiresIn = decoded.exp - now; // 令牌剩余的有效时间（秒）

            if (expiresIn > 0) {
                // 将令牌添加到黑名单，并设置过期时间
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
            const { id: userId } = req.user; // 从请求对象中获取用户ID
            const user = await User.findByPk(userId); // 根据用户ID查找用户信息

            if (!user) {
                return createFailResponse(res, 401, 'User not found');
            }

            // 生成一个新的JWT令牌并返回给客户端。由于我们已经实现了黑名单机制，旧的令牌仍然有效直到它被添加到黑名单为止。
            const newToken = generateToken(userId, user.role);

            return createSuccessResponse(res, 200, 'Refresh token successful', {
                token: newToken
            });
        } catch (error) {
            console.error('Error during refreshing token:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },
}

module.exports = authController;