'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('SecurityLogs', 'password_id', {
      type: Sequelize.UUID,
      allowNull: true, // 允许为空，因为不是所有日志都与密码直接相关, 比如登录日志等等
      field: 'password_id'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('SecurityLogs', 'password_id');
  }
};
