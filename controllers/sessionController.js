const { Session } = require('../models');
const { addToBlacklist } = require('../services/blacklistService');
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

            return createSuccessResponse(res, 'Sessions retrieved successfully', { sessions });
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

            // 检查会话是否存在且属于当前用户
            const sessionToRevoke = await Session.findOne({
                where: {
                    id,
                    userId: currentUserId,
                }
            })

            if (!sessionToRevoke) {
                return createFailResponse(res, 404, 'Session not found or does not belong to you');
            }

            // 计算JWT过期时间，并更新会话状态为非活跃
            const now = Math.floor(Date.now() / 1000);
            const expiresIn = Math.floor((sessionToRevoke.expiresAt.getTime() / 1000) - now);

            // 如果会话还未过期，则将其加入黑名单
            if (expiresIn > 0) {
                await addToBlacklist(sessionToRevoke.jti, expiresIn);
            }

            // 更新会话状态为非活跃
            await sessionToRevoke.update({ isActive: false });
            // TODO: 考虑是否需要彻底删除会话记录，取决于业务需求和隐私保护策略。
            // await sessionToRevoke.destroy();

            return createSuccessResponse(res, 'Session deleted successfully');
        } catch (error) {
            console.error('Delete session error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    }
}

module.exports = sessionController;