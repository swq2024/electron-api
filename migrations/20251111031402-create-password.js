'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Passwords', {
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
      categoryId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'category_id',
        comment: '关联的分类ID'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '密码所属应用名称'
      },
      username: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: '应用登录用户名'
      },
      encryptedPassword: {
        type: Sequelize.TEXT,
        allowNull: false,
        field: 'encrypted_password',
        comment: '加密后的密码'
      },
      url: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: '应用网址'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '备注信息'
      },
      isFavorite: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'is_favorite',
        comment: '是否为收藏'
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'is_deleted',
        comment: '是否已删除'
      },
      customFields: {
        type: Sequelize.JSON,
        defaultValue: {},
        field: 'custom_fields',
        comment: '自定义字段'
      },
      passwordStrength: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'password_strength',
        comment: '密码强度'
      },
      lastUsed: {
        type: Sequelize.DATE,
        field: 'last_used',
        comment: '最后一次使用时间'
      },
      expiresAt: {
        type: Sequelize.DATE,
        field: 'expires_at',
        comment: '密码过期时间'
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
    await queryInterface.dropTable('Passwords');
  }
};