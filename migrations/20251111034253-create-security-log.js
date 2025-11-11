'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SecurityLogs', {
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
      action: {
        type: Sequelize.ENUM(
          'login', 'logout', 'login_failed', 'password_changed',
          'password_created', 'password_updated', 'password_deleted',
          'account_created', 'account_updated', 'account_deleted',
          'account_locked', 'account_unlocked', 'two_factor_enabled',
          'two_factor_disabled', 'export_data', 'import_data'),
        allowNull: false,
      },
      details: {
        type: Sequelize.JSON
      },
      ipAddress: {
        type: Sequelize.STRING,
        field: 'ip_address',
      },
      userAgent: {
        type: Sequelize.STRING,
        field: 'user_agent',
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SecurityLogs');
  }
};