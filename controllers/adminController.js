const { User, Password, Category, SecurityLog } = require('../models');
const { validationResult } = require('express-validator');
const { createSuccessResponse, createFailResponse } = require('../utils/response');
const { logSecurityEvent } = require('../utils/logger');
const { Op } = require('sequelize');
const { parseBoolean } = require('../utils/parsers');

const adminController = {
    // 获取用户列表
    async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 20, search, role, status } = req.query;

            const whereClause = {};

            if (search) {
                whereClause[Op.or] = [
                    { username: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ];
            }

            if (role) {
                whereClause.role = role;
            }

            if (status === 'active') {
                whereClause.isActive = true
            }
            if (status === 'inactive') {
                whereClause.isActive = false
            }

            const offset = (page - 1) * limit;

            // 查询用户列表
            const { count, rows: users } = await User.findAndCountAll({
                where: whereClause,
                attributes: {
                    exclude: ['password', 'twoFactorSecret', 'tokenVersion', 'refreshTokenHash']
                },
                order: [['createdAt', 'DESC']],
                offset,
                limit: parseInt(limit)
            });

            // 查询每个用户的密码数量
            const usersWithPasswordCount = await Promise.all(
                users.map(async (user) => {
                    const passwordCount = await Password.count({
                        where: {
                            userId: user.id,
                        }
                    });

                    const userData = user.toJSON();
                    userData.passwordCount = passwordCount;
                    return userData;
                }));

            return createSuccessResponse(res, 200, 'Users retrieved successfully', {
                users: usersWithPasswordCount,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            console.error('Get all users error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 更新用户角色
    async updateUserRole(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return createFailResponse(res, 400, 'Validation error', errors.array());
            }

            const { id } = req.params;
            const { role } = req.body;
            const { id: adminId } = req.user; // 获取当前管理员的ID

            const user = await User.findByPk(id);
            if (!user) {
                return createFailResponse(res, 404, 'User not found');
            }

            // 防止管理员修改自己的角色
            if (adminId === user.id) {
                return createFailResponse(res, 400, 'Cannot modify your own role');
            }

            // 更新用户角色
            await user.update({ role });

            // 记录安全日志
            logSecurityEvent(adminId, 'user_role_updated', {
                targetUserId: user.id,
                newRole: role,
                ip: req.ip,
                userAgent: req.headers['user-agent']
            });

            return createSuccessResponse(res, 200, 'User role updated successfully', {
                userId: user.id,
                newRole: role
            });
        } catch (error) {
            console.error('Update user role error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 启用/禁用用户
    async toggleUserStatus(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return createFailResponse(res, 400, 'Validation error', errors.array());
            }
            
            const { id } = req.params;
            const { isActive } = req.body;
            const { id: adminId } = req.user; // 获取当前管理员的ID

            const parsedIsActive = parseBoolean(isActive);

            const user = await User.findByPk(id);
            if (!user) {
                return createFailResponse(res, 404, 'User not found');
            }

            // 防止管理员禁用自己的账户
            if (adminId === user.id && !parsedIsActive) {
                return createFailResponse(res, 400, 'Cannot disable your own account');
            }

            // 更新用户状态
            await user.update({ isActive: parsedIsActive });
            
            // 记录安全日志
            await logSecurityEvent(adminId, parsedIsActive ? 'user_enabled' : 'user_disabled', {
                targetUserId: user.id,
                newStatus: parsedIsActive ? 'active' : 'inactive',
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            return createSuccessResponse(res, 200, `User ${parsedIsActive ? 'enabled' : 'disabled'} successfully`);
        } catch (error) {
            console.error('Toggle user status error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 获取系统统计信息
    async getSystemStats(req, res) {
        try {
            // 用户统计
            const totalUsers = await User.count();
            const activeUsers = await User.count({ where: { isActive: true } });
            const adminUsers = await User.count({ where: { role: 'admin' } });
            const vipUsers = await User.count({ where: { role: 'vip' } });

            // 密码统计
            const totalPasswords = await Password.count();
            const strongPasswords = await Password.count({
                where: {
                    passwordStrength: { [Op.gte]: 4 } // 密码强度评分大于等于4为强密码
                }
            });
            const weakPasswords = await Password.count({
                where: {
                    passwordStrength: { [Op.lte]: 2 } // 密码强度评分小于等于2为弱密码
                }
            });

            // 分类统计
            const totalCategories = await Category.count();

            // 最近活跃用户
            const recentlyActiveUsers = await User.findAll({
                where: {
                    lastLogin: {
                        [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 最近7天
                    }
                },
                attributes: ['id', 'username', 'email', 'lastLogin'],
                order: [
                    ['lastLogin', 'DESC'],
                ],
                limit: 5,
            });

            // 组装统计信息
            const stats = {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    admins: adminUsers,
                    vips: vipUsers
                },
                passwords: {
                    total: totalPasswords,
                    strong: strongPasswords,
                    weak: weakPasswords
                },
                categories: {
                    total: totalCategories
                },
                recentlyActiveUsers: recentlyActiveUsers.map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    lastLogin: user.lastLogin
                }))
            };

            return createSuccessResponse(res, 200, 'System stats retrieved successfully', { data: stats });
        } catch (error) {
            console.error('Get system stats error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 获取所有安全日志
    async getAllSecurityLogs(req, res) {
        try {
            const { page = 1, limit = 20, userId, action } = req.query;

            const whereClause = {};
            if (userId) {
                whereClause.targetUserId = userId;
            }
            if (action) {
                whereClause.action = action;
            }
            const offset = (page - 1) * limit;
            const { count, rows: logs } = await SecurityLog.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'email']
                    }
                ],
                order: [
                    ['timestamp', 'DESC'],
                ],
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

module.exports = adminController;
