'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 20]
        }
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      passwordHash: { // 密码哈希值 (存储用户密码的哈希值)
        type: Sequelize.STRING,
        allowNull: false,
        field: 'password_hash'
      },
      salt: { // 盐值 (用于密码加密的盐值)
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('user', 'admin', 'VIP'),
        defaultValue: 'user'
      },
      isActive: { // 是否激活 (用于激活或禁用用户账户)
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
      },
      lastLogin: { // 最后登录时间 (用于记录用户最后一次登录的时间)
        type: Sequelize.DATE,
        field: 'last_login'
      },
      failedLoginAttempts: { // 失败的登录尝试次数 (用于防止暴力破解)
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'failed_login_attempts'
      },
      lockedUntil: { // 锁定直到的时间 (锁定用户直到某个时间点)
        type: Sequelize.DATE,
        field: 'locked_until'
      },
      masterPasswordHint: { // 主密码提示 (用于帮助用户找回忘记的密码)
        type: Sequelize.STRING,
        field: 'master_password_hint'
      },
      twoFactorEnabled: { // 是否启用双因素认证 (用于增强账户安全性)
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'two_factor_enabled'
      },
      twoFactorSecret: { // 双因素认证密钥 (用于双因素认证)
        type: Sequelize.STRING,
        field: 'two_factor_secret'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};