const { verifyToken } = require('../services/authService');
const { isBlacklisted } = require('../services/blacklistService');
const { User } = require('../models');
const { createFailResponse } = require('../utils/response');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return createFailResponse(res, 401, 'Access token required');
        }

        const token = authHeader.substring(7); // 从Bearer Token中提取令牌值

        const decoded = verifyToken(token); // 验证令牌的有效性

        /**
         * 例如：decoded = 
         * {
                userId: '70a74745-7323-476d-a700-5db94bb34d15',
                role: 'user',
                // 令牌签发时间戳 全称是Issued At 令牌签发时间戳，表示该令牌是在何时生成的。这对于追踪和调试是有用的，尤其是在需要确定令牌的时效性时。
                iat: 1762865370, 
                // 令牌过期时间戳 全称是Expiration Time 令牌过期时间戳，表示该令牌在何时失效。一旦过了这个时间点，就不能再使用它来访问受保护的资源了。
                exp: 1765457370 
            }
         */

        if (!decoded) {
            return createFailResponse(res, 401, 'Invalid or expired token');
        }

        // 检查令牌是否已被列入黑名单（例如，用户已登出）
        const isInBlacklist = await isBlacklisted(decoded.jti);
        if (isInBlacklist) {
            return createFailResponse(res, 401, 'Token has been revoked((logged out), please login again)');
        }

        const user = await User.findByPk(decoded.userId); // 根据令牌中的用户ID查找用户

        if (!user || !user.isActive) {
            return createFailResponse(res, 401, 'User not found or inactive');
        }

        req.user = user; // 将用户信息附加到请求对象上 方便在后续中间件或路由处理函数中使用
        req.token = token; // 登出时需要

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return createErrorResponse(res, 500, 'Internal server error');
    }
}

function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            createFailResponse(res, 403, 'Authentication required'); // 认证失败
        }

        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(req.user.role)) {
            createFailResponse(res, 403, 'Insufficient permissions'); // 权限不足
        }

        next();
    };
}
module.exports = {
    authenticate,
    requireRole
};