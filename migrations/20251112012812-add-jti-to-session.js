'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Sessions', 'jti', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true, // 添加唯一索引, 确保查询效率
      comment: 'JWT ID'
    });
    
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Sessions', 'jti');
  }
};
