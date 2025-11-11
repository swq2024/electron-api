'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_constiable) {
  // 使用环境变量中的数据库连接信息 (例如：DATABASE_URL="postgres://user:pass@example.com/dbname")
  sequelize = new Sequelize(process.env[config.use_env_constiable], config);
} else {
  // 初始化 Sequelize 实例
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
    // 添加其他配置选项
    {
      logging: env === 'development' ? console.log : false,
      pool: { 
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;