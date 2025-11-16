const { createClient } = require('redis');

let redisClient = null;

/**
 * 创建并返回一个Redis客户端实例
 * 使用单例模式, 确保整个应用只有一个 Redis 客户端
 */
class RedisClient {
    constructor() {
        // Redis 配置信息，根据你的环境进行修改
        this.config = {
            url: 'redis://localhost:6379',
            // password: 'your-redis-password', // 如果你的 Redis 服务器需要密码
            // database: 0, // 使用默认数据库，你也可以指定其他数据库
        }

        // 创建 Redis 客户端实例
        this.client = createClient(this.config);

        // 监听客户端事件
        this._setupEventListeners();

        this.isConnected = false;
    }

    /**
     * 设置客户端事件监听器
     * @private 私有方法，不能在类外部直接调用
     */
    _setupEventListeners() {
        // 连接成功事件
        this.client.on('connect', () => {
            console.log('✅ Redis 客户端已成功连接');
            this.isConnected = true;
        });

        // 客户端准备就绪，可以开始执行命令
        this.client.on('ready', () => {
            console.log('✅ Redis 客户端已准备就绪');
        });

        // 发生错误时触发
        this.client.on('error', (err) => {
            console.error('❌ Redis 客户端错误:', err.message);
            this.isConnected = false;
        });

        // 连接断开时触发
        this.client.on('end', () => {
            console.log('🔌 Redis 客户端连接已断开');
            this.isConnected = false;
        });
    }

    /**
     * 连接到 Redis 服务器
     * @returns {Promise<void>}
     */
    async connect() {
        if (!this.isConnected) {
            await this.client.connect();
        }
    }

    /**
     * 从 Redis 中获取一个键的值
     * @param {string} key 
     * @returns 
     */
    async get(key) {
        await this.connect(); // 确保连接已建立
        return this.client.get(key);
    }

    /**
     * 检查一个键是否存在在 Redis 中
     * @param {*} key
     * @returns Promise<number> 返回 1 表示键存在，0 表示不存在
     */
    async exists(key) {
        await this.connect(); // 确保连接已建立
        return this.client.exists(key);
    }

    /**
     * 向 Redis 中设置一个键值对
     * @param {string} key
     * @param {string} value
     * @returns Promise<string> 返回 "OK" 表示设置成功
     */
    async set(key, value) {
        await this.connect(); // 确保连接已建立
        return this.client.set(key, value);
    }

    /**
     * 向 Redis 中设置一个带过期时间的键值对
     * @param {string} key
     * @param {number} ttl 过期时间，单位为秒
     * @param {string} value 
     * @returns Promise<string> 返回 "OK" 表示设置成功
     */
    async setEx(key, ttl, value) {
        await this.connect(); // 确保连接已建立
        return this.client.setEx(key, ttl, value);
    }

    /**
     * 
     * @param {string|string[]} key 键名，可以是一个字符串或一个包含多个键名的数组
     * @returns Promise<number> 返回删除的键的数量
     */
    async del(keys) {
        await this.connect(); // 确保连接已建立
        return this.client.del(keys);
    }

    /**
     * 清空当前连接的数据库中的所有键
     * @returns Promise<string> 返回 "OK" 表示清空成功
     */
    async clear() {
        await this.connect(); // 确保连接已建立
        return this.client.flushDb();
    }

    /**
     * 清空 Redis 服务器上的所有数据库中的所有键值对
     * @returns Promise<string> 返回 "OK" 表示清空成功
     */
    async clearAll() {
        await this.connect(); // 确保连接已建立
        await this.client.flushAll();
    }

    /**
     * 关闭 Redis 客户端连接
     * @returns Promise<void>
     */
    async quit() {
        if (this.isConnected) {
            await this.client.quit();
            this.isConnected = false;
        }
    }

    /**
     * 获取 Redis 客户端实例的单例
     * @returns {RedisClient} Redis 客户端实例
     */
    static getInstance() {
        if (!redisClient) {
            redisClient = new RedisClient();
        }
        return redisClient;
    }
}

module.exports = RedisClient.getInstance();