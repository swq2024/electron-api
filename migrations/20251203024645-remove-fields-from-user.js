"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "two_factor_enabled");
    await queryInterface.removeColumn("Users", "two_factor_secret");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "two_factor_enabled", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn("Users", "two_factor_secret", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
