'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SecurityLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SecurityLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  SecurityLog.init({
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
    action: {
      type: DataTypes.ENUM(
        'login', 'logout', 'login_failed', 'password_changed', 'password_accessed',
        'password_created', 'password_updated', 'password_deleted',
        'account_created', 'account_updated', 'account_deleted',
        'account_locked', 'account_unlocked', 'two_factor_enabled','profile_updated', 
        'two_factor_disabled', 'export_data', 'import_data', 'user_role_updated',
        'user_enabled', 'user_disabled'
      ),
      allowNull: false
    },
    details: {
      type: DataTypes.JSON
    },
    ipAddress: {
      type: DataTypes.STRING,
      field: 'ip_address'
    },
    userAgent: {
      type: DataTypes.STRING,
      field: 'user_agent'
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'SecurityLog',
    timestamps: false
  });
  return SecurityLog;
};