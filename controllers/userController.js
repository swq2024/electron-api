const { User, SecurityLog, sequelize } = require("../models");
const { validationResult } = require("express-validator");
const { sendOk, sendErr } = require("../utils/response");
const { logSecurityEvent } = require("../utils/logger");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { generateTokenPair } = require("../services/authService");
const { parseBoolean } = require("../utils/parsers");

const userController = {
  // 获取个人信息
  async getProfile(req, res) {
    try {
      const { id: userId } = req.user;

      const user = await User.findByPk(userId, {
        attributes: [
          "id",
          "email",
          "username",
          "avatar",
          "createdAt",
          "updatedAt",
          "isActive",
          "lastLogin",
          "role",
        ],
      });

      if (!user) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 404,
          message: "用户不存在",
        });
      }

      return sendOk(res, 200, "用户信息检索成功", { user });
    } catch (error) {
      console.error("用户信息检索失败", error);
      return sendErr(res, error);
    }
  },

  // 更新个人信息
  async updateProfile(req, res) {
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

      const { id: userId } = req.user;
      const { username, email, avatar } = req.body;

      const user = await User.findByPk(userId);

      if (!user) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 404,
          message: "用户不存在",
        });
      }

      // 检查用户名和邮箱是否已被其他用户使用
      if (username && username !== user.username) {
        const existingUser = await User.findOne({
          where: {
            username,
            id: { [Op.ne]: userId },
          },
        });
        if (existingUser) {
          return sendErr(res, {
            isOperational: true,
            statusCode: 400,
            message: "用户名已被其他用户使用",
          });
        }
      }

      if (email && email !== user.email) {
        const existingUser = await User.findOne({
          where: {
            email,
            id: { [Op.ne]: userId },
          },
        });
        if (existingUser) {
          return sendErr(res, {
            isOperational: true,
            statusCode: 400,
            message: "邮箱已被其他用户使用",
          });
        }
      }

      // 更新用户信息
      await user.update({
        username: username || user.username,
        email: email || user.email,
        avatar: avatar || user.avatar,
      });

      return sendOk(
        res,
        200,
        "更新用户信息成功",
        {
          username: user.username,
          email: user.email,
          avatar: user.avatar,
        },
        "updatedUser",
      );
    } catch (error) {
      console.error("更新用户信息失败", error);
      return sendErr(res, error);
    }
  },

  // 更新账户主密码
  async changePassword(req, res) {
    const transaction = await sequelize.transaction();
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

      const { id: userId } = req.user;
      const { currentPassword, newPassword } = req.body;

      const user = await User.scope("withHashes").findOne(
        {
          where: {
            id: userId,
          },
        },
        { transaction },
      );

      if (!user) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 404,
          message: "用户不存在",
        });
      }

      // 验证当前密码是否正确
      const isPasswordValid = bcrypt.compareSync(
        currentPassword,
        user.passwordHash,
      );
      if (!isPasswordValid) {
        await transaction.rollback();
        return sendErr(res, {
          isOperational: true,
          statusCode: 400,
          message: "当前密码不正确",
        });
      }

      // 验证新密码是否与当前密码相同, 已经在路由中使用了自定义验证规则，此处不再重复验证

      // 这里直接修改password字段的值为新密码值即可。不用对newPassword进行哈希处理，
      // 因为已经在用户模型中对password字段(set方法)已经进行了哈希处理
      await user.update(
        {
          passwordHash: newPassword,
        },
        { transaction },
      );

      // 更新用户的token版本号，以确保所有旧令牌失效 -> 增加版本号
      const currentTokenVersion = user.tokenVersion; // 获取当前版本号
      await user.increment("tokenVersion", { transaction });

      // 清理会话
      await Session.destroy(
        {
          where: {
            userId,
          },
        },
        { transaction },
      );

      await transaction.commit();

      return sendOk(res, 200, "主密码更新成功，请使用新密码重新登录");
    } catch (error) {
      await transaction.rollback();
      console.error("更改密码失败", error);
      return sendErr(res, error);
    }
  },

  // 启用/禁用双因素认证
  async toggleTwoFactorAuth(req, res) {
    try {
      const { id: userId } = req.user;
      const { enable, secret } = req.body;

      const user = await User.findByPk(userId);

      if (!user) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 404,
          message: "用户不存在",
        });
      }
      const parsedEnable = parseBoolean(enable);

      if (parsedEnable && !secret) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 400,
          message: "启用双因素认证时，必须提供密钥",
        });
      }

      // 验证密钥的有效性（此处仅为示例，实际应用中应进行更复杂的校验）
      // if (parsedEnable && !validateSecret(secret)) {
      //     return sendErr(res, {
      //         isOperational: true,
      //         statusCode: 400,
      //         message: '无效的密钥'
      //     });
      // }

      // 更新双因素认证状态和密钥
      await user.update({
        twoFactorEnabled: parsedEnable,
        twoFactorSecret: parsedEnable ? secret : null,
      });

      // 记录安全日志
      await logSecurityEvent(
        req,
        parsedEnable ? "two_factor_enabled" : "two_factor_disabled",
        {
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        },
      );

      return sendOk(res, 200, `双因素认证已${parsedEnable ? "启用" : "禁用"}`);
    } catch (error) {
      console.error("启用/禁用双因素认证失败", error);
      return sendErr(res, error);
    }
  },

  // 获取用户的安全日志
  async getSecurityLogs(req, res) {
    try {
      const { id: userId } = req.user;
      const { page = 1, limit = 20 } = req.query;

      // 计算偏移量
      const offset = (page - 1) * limit;

      // 获取用户的安全日志记录
      const { count, rows: logs } = await SecurityLog.findAndCountAll({
        where: {
          userId,
        },
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
      console.error("安全日志检索失败", error);
      return sendErr(res, error);
    }
  },
};

module.exports = userController;
