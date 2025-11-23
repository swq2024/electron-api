"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Category.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      models.Category.hasMany(models.Password, {
        foreignKey: "categoryId",
        as: "passwords",
      });
    }
  }
  Category.init(
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING,
        defaultValue: "#3498db",
      },
      icon: {
        type: DataTypes.STRING,
        defaultValue: "folder",
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_default",
      },
    },
    {
      sequelize,
      modelName: "Category",
      indexes: [
        {
          unique: true,
          fields: ["user_id", "is_default"],
          where: {
            is_default: true, // 只对 isDefault 为 true 的记录施加唯一约束, 确保每个用户只有一个默认分类
          },
        },
      ],
    },
  );
  return Category;
};
