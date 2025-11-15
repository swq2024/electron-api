'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Sessions', 'rt_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'expires_at',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Sessions', 'rt_expires_at');
  }
};
