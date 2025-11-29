"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Passwords", "expires_at");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Passwords", "expires_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
};
