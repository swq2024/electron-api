const express = require('express');
const { join } = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const loadEnv = require('./utils/loadEnv');
loadEnv();

const indexRouter = require('./routes/index');
const articlesRouter = require('./routes/article');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/article', articlesRouter);

module.exports = app;

// git commit -m "feat: add encrypted env files"