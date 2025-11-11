'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Password extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Password.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Password.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
      Password.hasMany(models.PasswordHistory, { foreignKey: 'passwordId', as: 'history' });
    }
  }
  Password.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'category_id'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true
    },
    encryptedPassword: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'encrypted_password'
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_favorite'
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_deleted'
    },
    customFields: {
      type: DataTypes.JSON,
      defaultValue: {},
      field: 'custom_fields'
    },
    passwordStrength: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'password_strength'
    },
    lastUsed: {
      type: DataTypes.DATE,
      field: 'last_used'
    },
    expiresAt: {
      type: DataTypes.DATE,
      field: 'expires_at'
    }
  }, {
    sequelize,
    modelName: 'Password'
  });
  return Password;
};