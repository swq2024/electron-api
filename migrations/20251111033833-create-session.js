'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sessions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'user_id',
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: '会话标识'
      },
      deviceInfo: {
        type: Sequelize.JSON,
        field: 'device_info',
        comment: '设备信息'
      },
      ipAddress: {
        type: Sequelize.STRING,
        field: 'ip_address',
        comment: '登录IP'
      },
      userAgent: {
        type: Sequelize.STRING,
        field: 'user_agent',
        comment: '用户代理'
      },
      expiresAt: {
        type: Sequelize.DATE,
        field: 'expires_at',
        comment: '过期时间'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'is_active',
        comment: '是否激活'
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
    await queryInterface.dropTable('Sessions');
  }
};