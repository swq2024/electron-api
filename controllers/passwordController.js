const { Password, PasswordHistory } = require('../models');
const { validationResult } = require('express-validator');
const { createSuccessResponse, createFailResponse } = require('../utils/response');
const { encrypt, decrypt } = require('../services/encryptionService');
const { calculatePasswordStrength } = require('../services/passwordUtils')
const { logSecurityEvent } = require('../utils/logger');
const { Op } = require('sequelize');

const passwordController = {
    // 创建密码存储记录
    async create(req, res) {
        try {
            const errors = validationResult(req);
            if (errors.isEmpty()) {
                return createFailResponse(res, 400, 'Validation failed', errors.array());
            }

            const { title, username, password, url, notes, categoryId, customFields } = req.body;
            const {
                id: userId,
                salt: userSalt
            } = req.user;

            // 加密密码
            const encryptedPassword = encrypt(password, userSalt);


            // 计算密码强度
            const passwordStrength = calculatePasswordStrength(password);

            // 创建新密码记录
            const newPassword = await Password.create({
                userId,
                categoryId,
                title,
                username,
                encryptedPassword,
                url,
                notes,
                customFields,
                passwordStrength
            });

            // 记录安全日志
            await logSecurityEvent(userId, 'password_created', {
                passwordId: newPassword.id,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            return createSuccessResponse(res, 201, 'Password created successfully', {
                id: newPassword.id,
                title: newPassword.title,
                username: newPassword.username,
                url: newPassword.url,
                notes: newPassword.notes,
                categoryId: newPassword.categoryId,
                customFields: newPassword.customFields,
                passwordStrength: newPassword.passwordStrength,
                createdAt: newPassword.createdAt,
            });
        } catch (error) {
            console.error('Error creating password:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 获取所有密码存储列表
    async getAll(req, res) {
        try {
            const { id: userId } = req.user;
            const { categoryId, search, page = 1, limit = 20, sortBy = 'title', sortOrder = 'ASC' } = req.query;

            // 构建查询条件
            const whereClause = {
                userId,
                isDeleted: false
            };
            if (categoryId) {
                whereClause.categoryId = categoryId;
            }
            if (search) {
                whereClause[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { username: { [Op.like]: `%${search}%` } },
                    { url: { [Op.like]: `%${search}%` } },
                ]
            }

            // 计算偏移量
            const offset = (page - 1) * limit;

            // 查询密码列表
            const { count, rows: passwords } = await Password.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: 'Category',
                        as: 'category',
                        attributes: ['id', 'name', 'color', 'icon'],
                    }
                ],
                exclude: ['encryptedPassword'],

                order: [[sortBy, sortOrder.toUpperCase()]],
                offset,
                limit: parseInt(limit),
            });

            return createSuccessResponse(res, 200, 'Passwords retrieved successfully', {
                passwords,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page)
                }
            });
        } catch (error) {
            console.error('Get passwords error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 获取单个密码存储详情
    async getById(req, res) {
        try {
            const { id } = req.params;
            const {
                id: userId,
                salt: userSalt
            } = req.user;

            const password = await Password.findOne({
                where: {
                    id,
                    userId,
                    isDeleted: false
                },
                include: [
                    {
                        model: 'Category',
                        as: 'category',
                        attributes: ['id', 'name', 'color', 'icon']
                    }
                ],
            });

            if (!password) {
                return createFailResponse(res, 404, 'Password not found');
            }

            // 记录密码使用时间
            await password.update({ lastUsed: new Date() });

            // 解密密码
            const decryptedPassword = decrypt(password.encryptedPassword, userSalt);

            // 记录安全日志
            await logSecurityEvent(userId, 'password_accessed', {
                passwordId: password.id,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            return createSuccessResponse(res, 200, 'Password retrieved successfully', {
                id: password.id,
                title: password.title,
                username: password.username,
                password: decryptedPassword,
                url: password.url,
                notes: password.notes,
                categoryId: password.categoryId,
                category: password.category,
                customFields: password.customFields,
                passwordStrength: password.passwordStrength,
                isFavorite: password.is_favorite,
                createdAt: password.createdAt,
                updatedAt: password.updatedAt,
                lastUsed: password.last_used,
                expiresAt: password.expires_at
            })
        } catch (error) {
            console.error('Get password error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 更新密码存储记录
    async update(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return createFailResponse(res, 400, 'Validation failed', errors.array());
            }

            const { id } = req.params;
            const {
                id: userId,
                salt: userSalt
            } = req.user
            const { title, username, password, url, notes, categoryId, customFields } = req.body;

            // 查找现有密码记录
            const existingPassword = await Password.findOne({
                where: {
                    id,
                    userId,
                    isDeleted: false
                }
            });

            if (!existingPassword) {
                return createFailResponse(res, 404, 'Password not found');
            }

            // 检查密码是否发生变化，如果变化保存密码历史记录
            if (password && password !== decrypt(existingPassword.encryptedPassword, userSalt)) {
                // 保存密码历史记录
                await PasswordHistory.create({
                    passwordId: id, // 原始密码ID
                    encryptedPassword: existingPassword.encryptedPassword, // 原始加密密码
                })
            }

            // 准备更新数据
            const updateData = {
                title,
                username,
                url,
                notes,
                categoryId,
                customFields: customFields || {}
            }

            // 如果提供了新密码，则加密并更新
            if (password) {
                updateData.encryptedPassword = encrypt(password, userSalt); // 加密新密码
                updateData.passwordStrength = calculatePasswordStrength(password); // 计算密码强度
            }

            // 更新密码记录
            await existingPassword.update(updateData);

            // 记录安全日志
            await logSecurityEvent(userId, 'password_updated', {
                passwordId: id,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            return createSuccessResponse(res, 200, 'Password updated successfully');
        } catch (error) {
            console.error('Update password error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 删除密码存储记录
    async delete(req, res) {
        try {
            const { id } = req.params;
            const { id: userId } = req.user;

            // 查找并删除密码记录
            const password = await Password.findOne({
                where: {
                    id,
                    userId,
                    isDeleted: false
                }
            });

            if (!password) {
                return createFailResponse(res, 404, 'Password not found');
            }

            // 软删除
            await password.update({ isDeleted: true });

            // 记录安全日志
            await logSecurityEvent(userId, 'password_deleted', {
                passwordId: id,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            return createSuccessResponse(res, 200, 'Password deleted successfully');
        } catch (error) {
            console.error('Delete password error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 获取密码历史记录
    async getHistory(req, res) {
        try {
            const { id } = req.params;
            const {
                id: userId,
                salt: userSalt
            } = req.user;

            // 验证密码是否属于当前用户
            const password = await Password.findOne({
                where: {
                    id,
                    userId,
                    isDeleted: false
                }
            });

            if (!password) {
                return createFailResponse(res, 404, 'Password not found');
            }

            // 获取密码历史记录
            const history = await PasswordHistory.findAll({
                where: { passwordId: id },
                order: [['createdAt', 'DESC']], // 按创建时间降序排序
            })

            // 解密历史记录中的密码
            const decryptedPasswords = history.map(h => ({
                id: h.id,
                changedAt: h.changed_at,
                decryptedPassword: decrypt(h.encryptedPassword, userSalt)
            }));

            return createSuccessResponse(res, 200, 'Password history retrieved successfully', {
                history: decryptedPasswords
            })
        } catch (error) {
            console.error('Get password history error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    }
}

module.exports = passwordController;