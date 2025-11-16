'use strict';
const {
  Model,
  Op
} = require('sequelize');
const bcrypt = require('bcrypt');
const { BadRequest } = require('http-errors');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Password, { foreignKey: 'userId', as: 'passwords' });
      User.hasMany(models.Category, { foreignKey: 'userId', as: 'categories' });
      User.hasMany(models.Session, { foreignKey: 'userId', as: 'sessions' });
      User.hasMany(models.SecurityLog, { foreignKey: 'userId', as: 'securityLogs' });
    }

    async compareRefreshToken(refreshToken) {
      if (!this.refreshTokenHash) return false;
      return await bcrypt.compare(refreshToken, this.refreshTokenHash);
    }

    // 请求刷新令牌接口需要通过 refreshToken 查找用户
    static async findByRefreshToken(refreshToken) {
      if (!refreshToken) return null;
      // 1. 查找所有拥有 refreshTokenHash 的用户
      // 在大型系统中，这可能会是一个性能瓶颈。
      // 未来优化方向：将 userId 嵌入到 refreshToken 中，从而实现单用户查询。
      const usersWithHashes = await this.scope('withHashes').findOne({
        where: {
          refreshTokenHash: {
            [Op.ne]: null // 不包含 null 的 refreshTokenHash，即至少有一个有效的 hash 存在
          }
        },
        raw: false, // 返回完整的模型实例，而不是原始对象
      })

      if (!usersWithHashes) return null; // 没有用户拥有 refreshTokenHash，返回 null
      if(!usersWithHashes || typeof usersWithHashes.compareRefreshToken !== 'function') {
        console.error('User.findByRefreshToken did not return a valid Sequelize instance.');
        return null; // 用户模型不包含 compareRefreshToken 方法，返回 null
      }

      const isMatch = await usersWithHashes.compareRefreshToken(refreshToken);
      if(isMatch) {
        return usersWithHashes; // 刷新令牌匹配，返回用户实例
      }
      return null; // 刷新令牌不匹配，返回 null
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hash',
      set(value) {
        if (!value) throw new BadRequest('Password is required');
        if (value.length < 8 || value.length > 72)
          throw new BadRequest('Password must be between 6 and 72 characters');
        this.setDataValue('passwordHash', bcrypt.hashSync(value, 10));
      }
    },
    tokenVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'token_version'
    },
    refreshTokenHash: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'refresh_token_hash'
    },
    role: {
      type: DataTypes.ENUM('admin', 'user', 'vip'),
      defaultValue: 'user'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    lastLogin: {
      type: DataTypes.DATE,
      field: 'last_login'
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'failed_login_attempts'
    },
    lockedUntil: {
      type: DataTypes.DATE,
      field: 'locked_until'
    },
    masterPasswordHint: {
      type: DataTypes.STRING,
      field: 'master_password_hint'
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'two_factor_enabled'
    },
    twoFactorSecret: {
      type: DataTypes.STRING,
      field: 'two_factor_secret'
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    hooks: {},
    sequelize,
    modelName: 'User',
    defaultScope: {
      attributes: {
        exclude: ['passwordHash', 'refreshTokenHash'] // 默认不查询密码哈希和刷新令牌哈希
      }
    },
    scopes: {
      withHashes: {
        attributes: {
          include: ['passwordHash', 'refreshTokenHash'] // 用于需要密码哈希和刷新令牌哈希的查询，例如登录验证/刷新令牌验证
        }
      }
    }
  });
  return User;
};

