'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'token_version', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // 新用户默认版本为1
      after: 'password_hash' // 在password_hash字段之后添加，确保每次更新密码时版本号递增
    });
    await queryInterface.addColumn('Users', 'refresh_token_hash', {
      type: Sequelize.STRING,
      allowNull: true, // 允许为空，用户首次登录前或登出后为空
      after: 'token_version' // 在token_version字段之后添加，确保每次刷新令牌时更新此字段
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'token_version');
    await queryInterface.removeColumn('Users', 'refresh_token_hash');
  }
};
