const express = require('express');
const { join } = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const loadEnv = require('./utils/loadEnv');
loadEnv();
const { watchEnvFiles } = require('./utils/envWatcher');
try {
    watchEnvFiles();
} catch (err) {
    console.error(`❌ 环境变量监听失败：${err.message}`);
    watchEnvFiles().close(); // 关闭监听器，防止内存泄漏
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



app.use('/', indexRouter);
app.use('/article', articlesRouter);

module.exports = app;

// git commit -m "feat: add encrypted env files"