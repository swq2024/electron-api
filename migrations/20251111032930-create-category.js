'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Categories', {
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
        comment: '关联的用户ID'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '分类名称'
      },
      color: {
        type: Sequelize.STRING,
        defaultValue: '#3498db',
        comment: '分类颜色'
      },
      icon: {
        type: Sequelize.STRING,
        defaultValue: 'folder',
        comment: '分类图标, 默认为文件夹图标'
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'is_default',
        comment: '是否为默认分类'
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
    await queryInterface.dropTable('Categories');
  }
};