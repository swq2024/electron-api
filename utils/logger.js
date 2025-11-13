const { SecurityLog } = require('../models')

async function logSecurityEvent(userId, action, details = {}, passwordId = null, transaction = null) {
    try {
        await SecurityLog.create({
            userId,
            passwordId, // 确保传入passwordId, 如果对应的密码被删除, 该条安全日志会被自动删除
            action,
            details,
            ipAddress: details.ip || null,
            userAgent: details.userAgent || null,
        }, { transaction })
    } catch (error) {
        console.error('Error logging security event:', error);
    }
}

module.exports = {
    logSecurityEvent
}