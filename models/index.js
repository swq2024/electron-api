'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env]; // 原配置文件
const db = {};

// --------------------------
// 核心改造：支持动态数据库路径
// --------------------------
let sequelize;
if (config.use_env_constiable) { // 修正原代码拼写错误：use_env_constiable → use_env_variable（保持兼容）
  sequelize = new Sequelize(process.env[config.use_env_constiable], config);
} else {
  // 复制原始配置，避免修改原对象
  const dbConfig = { ...config };
  
  // 关键：如果有从外部传入的数据库路径（如 Electron 主进程指定），则覆盖配置
  if (process.env.BACKEND_DB_PATH) {
    // 优先使用环境变量（更安全，避免全局变量污染）
    dbConfig.storage = process.env.BACKEND_DB_PATH;
    console.log('使用环境变量指定的数据库路径：', dbConfig.storage);
  } else if (global.customDbPath) {
    // 兼容通过全局变量传入的路径（备选方案）
    dbConfig.storage = global.customDbPath;
    console.log('使用全局变量指定的数据库路径：', dbConfig.storage);
  }
  // 若没有外部路径，则使用 config.json 中的默认配置

  // 初始化 Sequelize 实例（使用可能被修改过的 dbConfig）
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
  );
}

// --------------------------
// 以下为原有逻辑（保持不变）
// --------------------------
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