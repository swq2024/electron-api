'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('@dotenvx/dotenvx').config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const adminId = uuidv4();
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123'; // 仅用于开发，生产环境必须设置环境变量

    const passwordHash = bcrypt.hashSync(adminPassword, 10);

    // rawSelect 方法执行一个原始的 SELECT SQL查询
    const existingAdmin = await queryInterface.rawSelect(
      'Users',
      {
        where: {
          email: adminEmail,
        }
      },
      ['id'] // 只返回id字段
    ) // 等效: SELECT id FROM users WHERE email = 'admin@yourdomain.com' LIMIT 1;

    // 实现幂等性, 幂等性: 一个操作可以执行多次，但最终产生的结果和只执行一次是相同的。
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping seeder.');
      return;
    }

    // 开启事务
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.bulkInsert('Users', [{
        id: adminId,
        username: 'admin',
        email: adminEmail,
        password_hash: passwordHash,
        token_version: 1,
        refresh_token_hash: null,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }], { transaction });

      await queryInterface.bulkInsert('Categories', [{
        id: uuidv4(),
        user_id: adminId,
        name: 'General',
        color: '#95a5a6',
        icon: 'folder',
        is_default: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }], { transaction });

      await queryInterface.bulkInsert('SecurityLogs', [{
        id: uuidv4(),
        user_id: adminId,
        action: 'account_created',
        details: JSON.stringify({
          source: 'system_seeder'
        }),
        ip_address: '127.0.0.1',
        user_agent: 'System Seeder',
        timestamp: new Date(),
      }], { transaction })

      await transaction.commit();

      console.log(`Admin user with email: ${adminEmail} created successfully with default category and security log.`);
    } catch (error) {
      await transaction.rollback();
      console.error('Failed to create admin user, category, and log:', error.msg || error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('Users', { email: adminEmail }, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Failed to revert admin user creation:', error);
      throw error;
    }
  }
};
