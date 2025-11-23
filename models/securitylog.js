"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SecurityLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.SecurityLog.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      models.SecurityLog.belongsTo(models.Password, {
        foreignKey: "passwordId",
        as: "password",
        onDelete: "CASCADE", // 当密码被删除时，与之相关的安全日志也应被级联删除
      });
    }
  }
  SecurityLog.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
      },
      passwordId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "password_id",
      },
      action: {
        type: DataTypes.ENUM(
          "login",
          "logout",
          "login_failed",
          "password_accessed",
          "password_created",
          "password_updated",
          "password_deleted",
          "account_created",
          "account_locked",
          "account_unlocked",
          "two_factor_enabled",
          "profile_updated",
          "two_factor_disabled",
          "export_data",
          "import_data",
          "user_role_updated",
          "user_enabled",
          "user_disabled",
          "default_category_changed",
          "token_refreshed",
        ),
        allowNull: false,
      },
      details: {
        type: DataTypes.JSON,
      },
      ipAddress: {
        type: DataTypes.STRING,
        field: "ip_address",
      },
      userAgent: {
        type: DataTypes.STRING,
        field: "user_agent",
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "SecurityLog",
      timestamps: false,
    },
  );
  return SecurityLog;
};
