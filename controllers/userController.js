const { User, SecurityLog } = require('../models');
const { validationResult } = require('express-validator');
const { createSuccessResponse, createFailResponse } = require('../utils/response');
const { logSecurityEvent } = require('../utils/logger');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { generateTokenPair } = require('../services/authService');

const userController = {
    // 获取用户信息
    async getProfile(req, res) {
        try {
            const { id: userId } = req.user;

            const user = await User.findByPk(userId, {
                attributes: {
                    exclude: ['passwordHash', 'twoFactorSecret', 'tokenVersion', 'refreshTokenHash']
                }
            });

            if (!user) {
                return createFailResponse(res, 404, 'User not found');
            }

            return createSuccessResponse(res, 200, 'User profile retrieved successfully', {
                user
            });
        } catch (error) {
            console.error('Get user profile error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 更新用户信息
    async updateProfile(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return createFailResponse(res, 400, 'Validation failed', errors.array());
            }

            const { id: userId } = req.user;
            const { username, email, masterPasswordHint } = req.body;

            const user = await User.findByPk(userId);

            if (!user) {
                return createFailResponse(res, 404, 'User not found');
            }

            // 检查用户名和邮箱是否已被其他用户使用
            if (username && username !== user.username) {
                const existingUser = await User.findOne({
                    where: {
                        username,
                        id: { [Op.ne]: userId }
                    }
                });
                if (existingUser) {
                    return createFailResponse(res, 400, 'Username already in use');
                }
            }

            if (email && email !== user.email) {
                const existingUser = await User.findOne({
                    where: {
                        email,
                        id: { [Op.ne]: userId }
                    }
                });
                if (existingUser) {
                    return createFailResponse(res, 400, 'Email already in use');
                }
            }

            // 更新用户信息
            await user.update({
                username: username || user.username,
                email: email || user.email,
                masterPasswordHint: masterPasswordHint !== undefined ? masterPasswordHint : user.masterPasswordHint
            });

            // 记录安全日志
            await logSecurityEvent(req, 'profile_updated', {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            return createSuccessResponse(res, 200, 'User profile updated successfully');
        } catch (error) {
            console.error('Update user profile error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 更新用户密码
    async changePassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return createFailResponse(res, 400, 'Validation failed', errors.array());
            }

            const { id: userId } = req.user;
            const { currentPassword, newPassword } = req.body;

            const user = await User.findByPk(userId);

            if (!user) {
                return createFailResponse(res, 404, 'User not found');
            }

            // 验证当前密码是否正确
            const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isPasswordValid) {
                return createFailResponse(res, 400, 'Current password is incorrect');
            }

            // 验证新密码是否与当前密码相同
            if (newPassword === currentPassword) {
                return createFailResponse(res, 400, 'New password cannot be the same as the current password');
            }

            // 更新用户密码
            const newPasswordHash = await bcrypt.hash(newPassword, 10);
            await user.update({
                passwordHash: newPasswordHash,
            });

            // 更新用户的token版本号，以确保所有旧令牌失效: 增加版本号并清除旧的refreshTokenHash
            const currentTokenVersion = user.tokenVersion; // 获取当前版本号
            await user.increment('tokenVersion');
            user.refreshTokenHash = null;

            // 记录安全日志
            await logSecurityEvent(userId, 'password_updated', {
                reason: `User changed password. Token version updated from ${currentTokenVersion} to ${user.tokenVersion}.`,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            // 生成新版本的令牌对并更新refreshTokenHash
            const { accessToken, refreshToken } = generateTokenPair(user);
            const newRefreshTokenHash = await bcrypt.hash(refreshToken, 10);
            await user.update({
                refreshTokenHash: newRefreshTokenHash,
            });

            return createSuccessResponse(res, 200, 'Password changed successfully! Your session has been secured with a new tokens.', {
                accessToken,
                refreshToken
            });
        } catch (error) {
            console.error('Change password error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 启用/禁用双因素认证
    async toggleTwoFactorAuth(req, res) {
        try {
            const { id: userId } = req.user;
            const { enable, secret } = req.body;

            const user = await User.findByPk(userId);

            if (!user) {
                return createFailResponse(res, 404, 'User not found');
            }

            if (enable && !secret) {
                return createFailResponse(res, 400, 'Secret is required to enable two-factor authentication');
            }

            // 验证密钥的有效性（此处仅为示例，实际应用中应进行更复杂的校验）
            // if (enable && !validateSecret(secret)) {
            //     return createFailResponse(res, 400, 'Invalid secret for two-factor authentication');
            // }

            // 更新双因素认证状态和密钥
            await user.update({
                twoFactorEnabled: enable,
                twoFactorSecret: enable ? secret : null
            });

            // 记录安全日志
            await logSecurityEvent(req, enable ? 'two_factor_enabled' : 'two_factor_disabled', {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            return createSuccessResponse(res, 200, `Two-factor authentication ${enable ? 'enabled' : 'disabled'} successfully`);
        } catch (error) {
            console.error('Toggle two-factor authentication error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 获取用户安全日志
    async getSecurityLogs(req, res) {
        try {
            const { id: userId } = req.user;
            const { page = 1, limit = 20 } = req.query;

            // 计算偏移量
            const offset = (page - 1) * limit;

            // 获取用户的安全日志记录
            const { count, rows: logs } = await SecurityLog.findAndCountAll({
                where: {
                    userId
                },
                order: [['timestamp', 'DESC']],
                offset,
                limit: parseInt(limit)
            });

            return createSuccessResponse(res, 200, 'Security logs retrieved successfully', {
                logs,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            console.error('Get security logs error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    }
}

module.exports = userController;