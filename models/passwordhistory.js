'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PasswordHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PasswordHistory.belongsTo(models.Password, { foreignKey: 'passwordId', as: 'password' });
    }
  }
  PasswordHistory.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    passwordId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'password_id'
    },
    encryptedPassword: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'encrypted_password'
    },
    changedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'changed_at'
    }
  }, {
    sequelize,
    modelName: 'PasswordHistory',
    timestamps: false
  });
  return PasswordHistory;
};