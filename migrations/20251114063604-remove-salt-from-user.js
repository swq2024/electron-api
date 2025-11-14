'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'salt');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'salt', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
