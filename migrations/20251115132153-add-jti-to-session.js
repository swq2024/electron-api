'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Sessions', 'jti', {
      type: Sequelize.JSON,
      after: 'user_id',
      allowNull: false,
      defaultValue: {},
      comment: 'JSON object containing { at: "at_jti", rt: "rt_jti" }'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Sessions', 'jti');
  }
};
