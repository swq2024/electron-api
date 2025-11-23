const { Password, PasswordHistory, Category, Like } = require("../models");
const { validationResult } = require("express-validator");
const { sendOk, sendErr } = require("../utils/response");
const { encrypt, decrypt } = require("../services/encryptionService");
const { calculatePasswordStrength } = require("../services/passwordService");
const { logSecurityEvent } = require("../utils/logger");
const { Op } = require("sequelize");
const { sequelize } = require("../models");

const passwordController = {
  // 创建密码存储记录
  async create(req, res) {
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

      const {
        title,
        username,
        password,
        url,
        notes,
        categoryId,
        customFields,
      } = req.body;
      const { id: userId } = req.user;

      // 如果没有categoryId，则使用用户注册时创建的默认分类
      let findCategoryId = categoryId;
      if (!findCategoryId) {
        const defaultCategory = await Category.findOne({
          where: {
            userId,
            isDefault: true,
          },
        });
        if (!defaultCategory) {
          return sendErr(res, {
            isOperational: true,
            statusCode: 400,
            message: "默认分类不存在",
          });
        }
        findCategoryId = defaultCategory.id;
      }

      // categoryId 必须存在且是有效的分类ID
      const category = await Category.findByPk(findCategoryId);
      if (!category) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 400,
          message: "分类不存在",
        });
      }

      // 加密密码
      const encryptedPassword = encrypt(password, process.env.MASTER_PASSWORD);

      // 计算密码强度
      const passwordStrength = calculatePasswordStrength(password);

      // 创建新密码记录
      const newPassword = await Password.create({
        userId,
        categoryId: findCategoryId,
        title,
        username,
        encryptedPassword,
        url,
        notes,
        customFields,
        passwordStrength,
      });

      // 记录安全日志
      await logSecurityEvent(
        userId,
        "password_created",
        {
          passwordId: newPassword.id,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        },
        newPassword.id,
      );

      return sendOk(res, 201, "密码创建成功", {
        id: newPassword.id,
        title: newPassword.title,
        username: newPassword.username,
        url: newPassword.url,
        notes: newPassword.notes,
        categoryId: newPassword.categoryId,
        customFields: newPassword.customFields,
        passwordStrength: newPassword.passwordStrength,
        createdAt: newPassword.createdAt,
      });
    } catch (error) {
      console.error("密码创建失败", error);
      return sendErr(res, error);
    }
  },

  // 获取所有密码存储列表
  async getAll(req, res) {
    try {
      const { id: userId } = req.user;
      const {
        categoryId,
        search,
        page = 1,
        limit = 20,
        sortBy = "title",
        sortOrder = "ASC",
      } = req.query;

      // 构建查询条件
      const whereClause = {
        userId,
      };
      if (categoryId) {
        whereClause.categoryId = categoryId;
      }
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { username: { [Op.like]: `%${search}%` } },
          { url: { [Op.like]: `%${search}%` } },
        ];
      }

      // 计算偏移量
      const offset = (page - 1) * limit;

      // 查询密码列表
      const { count, rows: passwords } = await Password.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "color", "icon"],
          },
        ],
        exclude: ["encryptedPassword"],

        order: [[sortBy, sortOrder.toUpperCase()]],
        offset,
        limit: parseInt(limit),
      });

      return sendOk(res, 200, "密码列表检索成功", {
        passwords,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
        },
      });
    } catch (error) {
      console.error("密码列表检索失败", error);
      return sendErr(res, error);
    }
  },

  // 获取密码存储详情
  async getById(req, res) {
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

      const { id: userId } = req.user;

      const password = await Password.findOne({
        where: {
          id,
          userId,
        },
        include: [
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "color", "icon"],
          },
        ],
      });

      if (!password) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 404,
          message: "密码记录不存在",
        });
      }

      // 记录密码使用时间
      await password.update({ lastUsed: new Date() });

      // 解密密码
      const decryptedPassword = decrypt(
        password.encryptedPassword,
        process.env.MASTER_PASSWORD,
      );

      // 记录安全日志
      await logSecurityEvent(
        userId,
        "password_accessed",
        {
          passwordId: password.id,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        },
        id,
      );

      return sendOk(res, 200, "密码详情获取成功", {
        id: password.id,
        title: password.title,
        username: password.username,
        password: decryptedPassword,
        url: password.url,
        notes: password.notes,
        categoryId: password.categoryId,
        category: password.category,
        customFields: password.customFields,
        passwordStrength: password.passwordStrength,
        isFavorite: password.is_favorite,
        createdAt: password.createdAt,
        updatedAt: password.updatedAt,
        lastUsed: password.last_used,
        expiresAt: password.expires_at,
      });
    } catch (error) {
      console.error("密码详情获取失败", error);
      return sendErr(res, error);
    }
  },

  // 更新密码存储记录
  async update(req, res) {
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
      const { id: userId } = req.user;
      const {
        title,
        username,
        password,
        url,
        notes,
        categoryId,
        customFields,
      } = req.body;

      // 查找现有密码记录
      const existingPassword = await Password.findOne({
        where: {
          id,
          userId,
        },
      });

      if (!existingPassword) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 404,
          message: "密码记录不存在",
        });
      }

      // 检查密码是否发生变化，如果变化保存密码历史记录
      if (
        password &&
        password !==
          decrypt(
            existingPassword.encryptedPassword,
            process.env.MASTER_PASSWORD,
          )
      ) {
        // 保存密码历史记录
        await PasswordHistory.create({
          passwordId: id, // 原始密码ID
          encryptedPassword: existingPassword.encryptedPassword, // 原始加密密码
        });
      }

      // 准备更新数据
      const updateData = {
        title,
        username,
        url,
        notes,
        categoryId,
        customFields: customFields || {},
      };

      // 如果提供了新密码，则加密并更新
      if (password) {
        updateData.encryptedPassword = encrypt(
          password,
          process.env.MASTER_PASSWORD,
        ); // 加密新密码
        updateData.passwordStrength = calculatePasswordStrength(password); // 计算密码强度
      }

      // 更新密码记录
      await existingPassword.update(updateData);

      // 记录安全日志
      await logSecurityEvent(
        userId,
        "password_updated",
        {
          passwordId: id,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        },
        id,
      );

      return sendOk(res, 200, "密码更新成功");
    } catch (error) {
      console.error("密码更新失败", error);
      return sendErr(res, error);
    }
  },

  // 删除密码存储记录
  async delete(req, res) {
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
      const { id: userId } = req.user;

      // 查找并删除密码记录
      const password = await Password.findOne({
        where: {
          id,
          userId,
        },
      });

      if (!password) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 404,
          message: "密码记录不存在",
        });
      }

      // 软删除
      await Password.destroy({ where: { id } });

      // 记录安全日志
      await logSecurityEvent(
        userId,
        "password_deleted",
        {
          passwordId: id,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        },
        id,
      );

      return sendOk(res, 200, "密码删除成功");
    } catch (error) {
      console.error("密码删除失败", error);
      return sendErr(res, error);
    }
  },

  // 批量删除密码记录
  async deleteBatch(req, res) {
    // Express默认不会解析DELETE请求中的body, 所以这里需要使用POST请求
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

      const { ids } = req.body;
      const { id: userId } = req.user;

      // 批量删除密码记录
      const affectRows = await Password.destroy({ where: { id: ids } });
      if (affectRows === 0) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 404,
          message: "没有任何密码记录被删除",
        });
      }
      // 记录安全日志
      await logSecurityEvent(userId, "password_deleted_batch", {
        // 由于这个action是仅代表删除密码, 这里可标注批量删除相关信息
        passwordIds: ids,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });

      return sendOk(res, 200, "批量删除密码成功");
    } catch (error) {
      console.error("批量删除密码失败", error);
      return sendErr(res, error);
    }
  },

  // 获取密码历史记录
  async getHistory(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;

      // 验证密码是否属于当前用户
      const password = await Password.findOne({
        where: {
          id,
          userId,
        },
      });

      if (!password) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 404,
          message: "密码历史记录不存在",
        });
      }

      // 获取密码历史记录
      const history = await PasswordHistory.findAll({
        where: { passwordId: id },
        order: [["changed_at", "DESC"]], // 按更改时间降序排列
      });

      // 解密历史记录中的密码
      const decryptedPasswords = history.map((h) => ({
        id: h.id,
        changedAt: h.changed_at,
        decryptedPassword: decrypt(
          h.encryptedPassword,
          process.env.MASTER_PASSWORD,
        ),
      }));

      return sendOk(res, 200, "密码历史记录检索成功", {
        history: decryptedPasswords,
      });
    } catch (error) {
      console.error("密码历史记录检索失败", error);
      return sendErr(res, error);
    }
  },

  // 获取回收站中的密码
  async getAllTrash(req, res) {
    try {
      const { id: userId } = req.user;
      const { page = 1, limit = 20 } = req.query;

      const offset = (page - 1) * limit;

      // 获取用户所有已删除的密码记录
      const { count, rows: deletedPasswords } = await Password.findAndCountAll({
        where: {
          userId,
          deletedAt: { [Op.not]: null }, // 只查询软删除的记录
        },
        attributes: ["id", "title", "deletedAt"],
        order: [["deletedAt", "DESC"]],
        limit: limit,
        offset,
        paranoid: false, // 关闭软删除特性才能查询到软删除的记录
      });

      return sendOk(res, 200, "回收站密码记录检索成功", {
        passwords: deletedPasswords,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error("回收站密码记录检索失败", error);
      return sendErr(res, error);
    }
  },

  // 还原指定密码记录
  async restore(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;

      console.log("id", id);

      // 查找并还原密码记录
      const passwordToRestore = await Password.findOne({
        where: {
          id,
          userId,
        },
        paranoid: false, // 关闭软删除特性才能查询到软删除的记录
      });

      if (!passwordToRestore) {
        return sendErr(res, {
          isOperational: true,
          statusCode: 404,
          message: "密码记录不存在",
        });
      }

      // 还原密码记录
      await Password.restore({ where: { id } });

      return sendOk(res, 200, "密码恢复成功");
    } catch (error) {
      console.error("密码恢复失败", error);
      return sendErr(res, error);
    }
  },

  // 批量还原密码记录
  async restoreAll(req, res) {
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

      const { ids } = req.body;
      const { id: userId } = req.user;

      // 批量还原密码记录
      await Password.restore({
        where: {
          id: ids, // 确保传入的是一个数组
          userId,
        },
      });

      return sendOk(res, 200, "密码批量恢复成功");
    } catch (error) {
      console.error("密码批量恢复失败", error);
      return sendErr(res, error);
    }
  },

  // 永久删除密码记录
  async deletePermanently(req, res) {
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
      const { id: userId } = req.user;

      // 查找并永久删除密码记录
      await Password.destroy({
        where: {
          id,
          userId,
        },
        force: true, // 强制删除，忽略软删除标志
      });

      return sendOk(res, 200, "密码永久删除成功");
    } catch (error) {
      console.error("密码永久删除失败", error);
      return sendErr(res, error);
    }
  },

  // 批量永久删除密码记录
  async deleteBatchPermanently(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return (
          sendErr,
          {
            isOperational: true,
            statusCode: 400,
            message: "Validation failed",
            errors: errors.array(),
          }
        );
      }

      const { ids } = req.body;
      const { id: userId } = req.user;

      // 批量永久删除密码记录
      await Password.destroy({
        where: {
          id: ids,
          userId,
        },
        force: true, // 强制删除，忽略软删除标志
      });

      return sendOk(res, 200, "密码批量永久删除成功");
    } catch (error) {
      console.error("密码批量永久删除失败", error);
      return sendErr(res, error);
    }
  },

  // 永久删除所有密码记录
  async deletePermanentlyAll(req, res) {
    try {
      const { id: userId } = req.user;
      // 查找当前用户的所有密码记录
      await Password.destroy({
        where: {
          userId,
        },
        force: true, // 强制删除，忽略软删除标志
      });
      return sendOk(res, 200, "所有密码记录已永久删除");
    } catch (error) {
      console.error("删除所有密码记录失败", error);
      return sendErr(res, error);
    }
  },

  // 收藏/取消收藏密码记录
  async collectPassword(req, res) {
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
      const { passwordId } = req.body;
      const password = await Password.findByPk(passwordId, { transaction });
      if (!password) {
        return sendErr(res, new Error("password not found"));
      }
      const like = await Like.findOne(
        {
          where: { userId, passwordId },
        },
        { transaction },
      );

      if (!like) {
        await Like.create({ userId, passwordId }, { transaction });
        await password.update({ isFavorite: true }, { transaction });
        await transaction.commit();
        return sendOk(res, 201, "收藏成功");
      } else {
        await like.destroy({ transaction });
        await password.update({ isFavorite: false }, { transaction });
        await transaction.commit();
        return sendOk(res, 200, "取消收藏成功");
      }
    } catch (error) {
      await transaction.rollback();
      sendErr(res, error);
    }
  },
};

module.exports = passwordController;
