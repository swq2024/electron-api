const express = require('express');
const fs = require('fs');

const authRoutes = require('./auth');
const userRoutes = require('./users');
const passwordRoutes = require('./passwords');
const categoryRoutes = require('./categories');
const toolsRoutes = require('./tools');
const seesionRoutes = require('./sessions');
const adminRoutes = require('./admin');
const indexController = require('../controllers/indexController');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/passwords', passwordRoutes);
router.use('/categories', categoryRoutes);
router.use('/tools', toolsRoutes);
router.use('/sessions', seesionRoutes);
router.use('/admin', adminRoutes);

// 主页路由
router.get('/', indexController.index);

// 健康检查端点
router.get('/health', indexController.healthCheck)

// 清除 Redis 缓存
router.delete('/redis-cache', indexController.clearRedisCache);

module.exports = router;
