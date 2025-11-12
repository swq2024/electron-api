'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Passwords', 'deletedAt', {
      type: Sequelize.DATE,
    });
    
    await queryInterface.addIndex('Passwords', {
      fields: ['deletedAt'],
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Passwords', 'deletedAt');
  }
};
