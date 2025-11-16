const { Session } = require('../models');
const { createSuccessResponse, createFailResponse } = require('../utils/response');
const { Op } = require('sequelize');

const sessionController = {
    // 获取当前用户的所有活动会话
    async getAll(req, res) {
        try {
            const { id: userId } = req.user;

            const sessions = await Session.findAll({
                where: {
                    userId,
                    isActive: true, // 只获取当前活跃的会话
                    expiresAt: { [Op.gt]: new Date() } // 只获取未过期的会话
                },
                attributes: ['id', 'deviceInfo', 'ipAddress', 'createdAt', 'expiresAt'],
                order: [['createdAt', 'DESC']] // 按创建时间降序排列
            });

            return createSuccessResponse(res, 200, 'Sessions retrieved successfully', { sessions });
        } catch (error) {
            console.error('Get sessions error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 注销指定会话
    async deleteById(req, res) {
        try {
            const { id } = req.params;
            const { id: currentUserId } = req.user;
           
            const session = await Session.findOne({
                where: {
                    id,
                    userId: currentUserId, // 确保会话属于当前用户
                    isActive: true // 只允许注销活跃的会话
                }
            });

            if (!session) {
                return createFailResponse(res, 404, 'Session not found or already revoked');
            }

            await session.update({ isActive: false });

            return createSuccessResponse(res, 200, 'Session revoked successfully');
        } catch (error) {
            console.error('Delete session error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    }
}

module.exports = sessionController;