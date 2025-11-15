const Redis = require('redis');

let redisClient = null;

/**
 * 创建并返回一个Redis客户端实例
 * 使用单例模式, 确保整个应用只有一个 Redis 客户端
 */
const getRedisClient = () => {
    if (redisClient) {
        return redisClient;
    }
    try {
        redisClient = Redis.createClient({
            url: 'redis://localhost:6379'
        })

        redisClient.on('connect', () => {
            console.log('Redis Client Connected');
        });

        redisClient.on('error', (err) => {
            console.error('Redis Client Error', err);
        });

        redisClient.connect();

    } catch (e) {
        console.error('Failed to create Redis client', e);
    }

    return redisClient;
}

module.exports = {
    getRedisClient
};