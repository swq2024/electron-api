const redisClient = require('../services/redisService');

const BLACKLIST_PREFIX = 'blacklist:';

/**
 * 将令牌加入黑名单
 * @param {string} token - JWT令牌
 * @param {number} expiresIn - 令牌剩余有效时间（秒）
 * @returns {Promise<boolean>} - 如果成功加入黑名单返回true
 */
const addToBlacklist = async (jti, expiresIn) => {
    if (!jti) {
        console.error('Invalid token or missing jti for blacklisting.');
        return false;
    }

    try {
        const key = `${BLACKLIST_PREFIX}${jti}`;
        // 将jti存入Redis，并设置过期时间
        const result = await redisClient.setEx(key, expiresIn, 'true');
        console.log(`Token ${jti} added to blacklist.`);

        return result === 'OK';
    } catch (error) {
        console.error('Failed to add token to blacklist:', error);
        return false;
    }
};

/**
 * 检查令牌是否在黑名单中
 * @param {string} jti - JWT ID
 * @returns {Promise<boolean>} - 如果在黑名单中返回true
 */
const isBlacklisted = async (jti) => {
    if (!jti) return false;

    try {
        const key = `${BLACKLIST_PREFIX}${jti}`;
        const result = await redisClient.exists(key);

        return result === 1;
    } catch (error) {
        console.error('Failed to check blacklist:', error);
        return true;
    }
};


/**
 * 移除令牌的黑名单状态
 * @param {*} jti - JWT ID
 * @returns {Promise<boolean>} - 如果成功移除返回true
 */
const removeFromBlacklist = async (jti) => {
    if (!jti) return false;

    try {
        const key = `${BLACKLIST_PREFIX}${jti}`;
        const result = await redisClient.del(key);
        console.log(`Token ${jti} removed from blacklist.`);
        return result > 0;
    } catch (error) {
        console.error('Failed to remove token from blacklist:', error);
        return false;
    }
}

module.exports = {
    addToBlacklist,
    isBlacklisted,
    removeFromBlacklist
};