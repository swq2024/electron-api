const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const { join } = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const routes = require('./routes/index');
const { errorHandler } = require('./middlewares/errorHandler');

const loadEnv = require('./utils/loadEnv');
loadEnv();

const app = express();

// 安全中间件
app.use(helmet())

// 压缩响应内容中间件
app.use(compression());

// 请求日志中间件
app.use(logger('dev'));
// 解析请求体中间件 限制请求体大小为10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
// 解析cookie中间件
app.use(cookieParser());
// 静态文件中间件
app.use(express.static(join(__dirname, 'public')));
// 错误处理中间件
app.use(errorHandler);

app.use('/api', routes);

module.exports = app;