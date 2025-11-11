const { SecurityLog } = require('../models')

async function logSecurityEvent(userId, action, details = {}) {
    try {
        await SecurityLog.create({
            userId,
            action,
            details,
            ipAddress: details.ip || null,
            userAgent: details.userAgent || null,
        })
    } catch (error) {
        console.error('Error logging security event:', error);
    }
}

module.exports = {
    logSecurityEvent
}