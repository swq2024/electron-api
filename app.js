const express = require('express');
const { join } = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const loadEnv = require('./utils/loadEnv');
loadEnv();
const { watchEnvFiles } = require('./utils/envWatcher');
try {
    // 只有在本地开发环境，监听 .env 文件变化, 生产环境不监听
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
        watchEnvFiles();
        console.log('ℹ️  开发环境，监听 .env 文件变化');
    } else {
        watchEnvFiles().close(); // 关闭监听器，防止内存泄漏
        console.log('ℹ️  非开发环境，不监听 .env 文件变化');
    }
} catch (err) {
    console.error(`❌ 环境变量监听失败：${err.message}`);
    watchEnvFiles().close();
}
// require('./utils/validateEnv')() // 暂不需要验证环境变量

const indexRouter = require('./routes/index');
const articlesRouter = require('./routes/article');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));

console.log(`Hello ${process.env.HELLO}`)
console.log(`DB_PASSWORD ${process.env.PROT}`);
console.log(process.env.LOG_LEVEL);
console.log(process.env.NODE_ENV);

app.use('/', indexRouter);
app.use('/article', articlesRouter);

module.exports = app;

// git commit -m "feat: add encrypted env files"