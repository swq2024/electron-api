'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PasswordHistories', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      passwordId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'password_id',
      },
      encryptedPassword: {
        type: Sequelize.TEXT,
        allowNull: false,
        field: 'encrypted_password',
      },
      changedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        field: 'changed_at',
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PasswordHistories');
  }
};