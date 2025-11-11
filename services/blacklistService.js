const redis = require('redis');
const { verifyToken } = require('./authService')

// 创建 Redis 客户端
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

// 监听 Redis 客户端错误事件
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// 连接 Redis 服务器
redisClient.connect().catch(console.error);

const BLACKLIST_PREFIX = 'blacklist:';

/**
 * 将令牌添加到黑名单
 * @param {string} token - 需要添加到黑名单的令牌
 * @param {number} expiresIn - 令牌在黑名单中过期的时间（秒）
 * @returns {Promise<void>} - 返回一个 Promise，表示操作完成或失败
 */

const addToBlacklist = async (token, expiresIn) => {
  try {
    // 从令牌中提取jti
    const decoded = verifyToken(token);
    if (!decoded || !decoded.jti) {
      console.error('Invalid token or missing jti for blacklisting.');
      return;
    }

    const key = `${BLACKLIST_PREFIX}${decoded.jti}`;
    // 将jti存入Redis，并设置过期时间
    await redisClient.setEx(key, expiresIn, 'true');
    console.log(`Token ${decoded.jti} added to blacklist.`);
  } catch (error) {
    console.error('Failed to add token to blacklist:', error);
  }
};

/**
 * 检查令牌是否在黑名单中
 * @param {string} jti - JWT ID
 * @returns {Promise<boolean>} - 如果在黑名单中返回true
 */
const isBlacklisted = async (jti) => {
  try {
    if (!jti) return false;

    const key = `${BLACKLIST_PREFIX}${jti}`;
    const result = await redisClient.get(key);
    return result === 'true';
  } catch (error) {
    console.error('Failed to check blacklist:', error);
    // 在Redis出错时，为了安全起见，可以选择拒绝请求
    // 但根据业务需求，也可以选择允许通过
    return false;
  }
};

module.exports = {
  addToBlacklist,
  isBlacklisted
};