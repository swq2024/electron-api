const { Session } = require('../models');
const { sendOk, sendErr } = require('../utils/response');
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

            return sendOk(res, 200, '会话列表获取成功', { sessions });
        } catch (error) {
            console.error('获取会话列表失败', error);
            return sendErr(res, error);
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
                return sendErr(res, {
                    isOperational: true,
                    statusCode: 404,
                    message: '会话不存在或已过期'
                });
            }

            await session.update({ isActive: false });

            return sendOk(res, 200, '会话已注销');
        } catch (error) {
            console.error('注销会话失败', error);
            return sendErr(res, error);
        }
    }
}

module.exports = sessionController;