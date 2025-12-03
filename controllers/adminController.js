const { User, Password, Category, SecurityLog, Session } = require("../models");
const { validationResult } = require("express-validator");
const { sendOk, sendErr } = require("../utils/response");
const { logSecurityEvent } = require("../utils/logger");
const { Op } = require("sequelize");
const { parseBoolean } = require("../utils/parsers");
const redisClient = require("../services/redisService");

const adminController = {
  // 获取用户列表
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 20, search, role, status } = req.query;

      const whereClause = {};

      if (search) {
        whereClause[Op.or] = [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ];
      }

      if (role) {
        whereClause.role = role;
      }

      if (status === "active") {
        whereClause.isActive = true;
      }
      if (status === "inactive") {
        whereClause.isActive = false;
      }

      const offset = (page - 1) * limit;

      // 查询用户列表
      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        attributes: {
          exclude: [
            "password",
            "twoFactorSecret",
            "tokenVersion",
            "refreshTokenHash",
          ],
        },
        order: [["createdAt", "DESC"]],
        offset,
        limit: parseInt(limit),
      });

      // 查询每个用户的密码数量
      const usersWithPasswordCount = await Promise.all(
        users.map(async (user) => {
          const passwordCount = await Password.count({
            where: {
              userId: user.id,
            },
          });

          const userData = user.toJSON();
          userData.passwordCount = passwordCount;
          return userData;
        }),
      );

      return sendOk(res, 200, "用户列表检索成功", {
        users: usersWithPasswordCount,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error("用户列表检索失败:", error);
      return sendErr(res, error);
    }
  },

  // 更新用户角色
  async updateUserRole(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 400,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { role } = req.body;
      const { id: adminId } = req.user; // 获取当前管理员的ID

      const user = await User.findByPk(id);
      if (!user) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 404,
          message: "用户未找到",
        });
      }

      // 防止管理员修改自己的角色
      if (adminId === user.id) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 400,
          message: "管理员不能修改自己的角色",
        });
      }

      // 更新用户角色
      await user.update({ role });

      // 记录安全日志
      logSecurityEvent(adminId, "user_role_updated", {
        targetUserId: user.id,
        newRole: role,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      return sendOk(res, 200, "更新用户角色成功", {
        userId: user.id,
        newRole: role,
      });
    } catch (error) {
      console.error("用户角色更新失败:", error);
      return sendErr(res, error);
    }
  },

  // 启用/禁用用户
  async toggleUserStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 400,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { isActive } = req.body;
      const { id: adminId } = req.user; // 获取当前管理员的ID

      const parsedIsActive = parseBoolean(isActive);

      const user = await User.findByPk(id);
      if (!user) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 404,
          message: "用户未找到",
        });
      }

      // 防止管理员禁用自己的账户
      if (adminId === user.id && !parsedIsActive) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 400,
          message: "管理员不能禁用自己的账户",
        });
      }

      // 更新用户状态
      await user.update({ isActive: parsedIsActive });
      // 如果禁用用户
      if (!parsedIsActive) {
        // 销毁会话: 立即踢出用户，使其 AT/RT 失效
        await Session.destroy({ where: { userId: user.id } });
        // 清除用户refreshTokenHash
        await user.update({
          refreshTokenHash: null,
        });
      }

      // 记录安全日志
      await logSecurityEvent(
        adminId,
        parsedIsActive ? "user_enabled" : "user_disabled",
        {
          targetUserId: user.id,
          newStatus: parsedIsActive ? "active" : "inactive",
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        },
      );

      return sendOk(res, 200, `用户 ${parsedIsActive ? "启用" : "禁用"} 成功`);
    } catch (error) {
      console.error("用户状态切换失败:", error);
      return sendErr(res, error);
    }
  },

  // 获取系统统计信息
  async getSystemStats(req, res) {
    try {
      // 用户统计
      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { isActive: true } });
      const adminUsers = await User.count({ where: { role: "admin" } });
      const vipUsers = await User.count({ where: { role: "vip" } });

      // 密码统计
      const totalPasswords = await Password.count();
      const strongPasswords = await Password.count({
        where: {
          passwordStrength: { [Op.gte]: 4 }, // 密码强度评分大于等于4为强密码
        },
      });
      const weakPasswords = await Password.count({
        where: {
          passwordStrength: { [Op.lte]: 2 }, // 密码强度评分小于等于2为弱密码
        },
      });

      // 分类统计
      const totalCategories = await Category.count();

      // 最近活跃用户
      const recentlyActiveUsers = await User.findAll({
        where: {
          lastLogin: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 最近7天
          },
        },
        attributes: ["id", "username", "email", "lastLogin"],
        order: [["lastLogin", "DESC"]],
        limit: 5,
      });

      // 组装统计信息
      const stats = {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
          vips: vipUsers,
        },
        passwords: {
          total: totalPasswords,
          strong: strongPasswords,
          weak: weakPasswords,
        },
        categories: {
          total: totalCategories,
        },
        recentlyActiveUsers: recentlyActiveUsers.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          lastLogin: user.lastLogin,
        })),
      };

      return sendOk(res, 200, "系统统计信息检索成功", { data: stats });
    } catch (error) {
      console.error("系统统计信息检索失败:", error);
      return sendErr(res, error);
    }
  },

  // 获取所有安全日志
  async getAllSecurityLogs(req, res) {
    try {
      const { page = 1, limit = 20, userId, action } = req.query;

      const whereClause = {};
      if (userId) {
        whereClause.targetUserId = userId;
      }
      if (action) {
        whereClause.action = action;
      }
      const offset = (page - 1) * limit;
      const { count, rows: logs } = await SecurityLog.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "email"],
          },
        ],
        order: [["timestamp", "DESC"]],
        offset,
        limit: parseInt(limit),
      });

      return sendOk(res, 200, "安全日志检索成功", {
        logs,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error("安全日志检索失败:", error);
      return sendErr(res, error);
    }
  },
};

module.exports = adminController;
