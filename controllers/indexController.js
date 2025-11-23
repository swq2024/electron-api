const { sendOk, sendErr } = require("../utils/response");
const redisClient = require("../services/redisService");
// const dayjs = require("dayjs");

const indexController = {
  // 主页路由
  async index(req, res) {
    return sendOk(res, 200, "Welcome to the homepage!");
  },

  // 健康检查端点
  async healthCheck(req, res) {
    try {
      return sendOk(res, 200, "Everything is fine!", {
        uptime: Math.floor(process.uptime()), // 进程运行时间（秒）
        // currentTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        currentTime: new Intl.DateTimeFormat("zh-CN", {
          timeZone: "Asia/Shanghai",
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false, // 24小时制
        }).format(Date.now()),
      });
    } catch (error) {
      return sendErr(res, error);
    }
  },

  // 清除 Redis 缓存
  async clearRedisCache(req, res) {
    try {
      await redisClient.clearAll(); // 清空所有数据库中的数据

      return sendOk(res, 200, "Redis 缓存清除成功");
    } catch (error) {
      console.error("Redis 缓存清除失败:", error);
      return sendErr(res, error);
    } finally {
      await redisClient.quit(); // 关闭 Redis 连接
    }
  },
};

module.exports = indexController;
