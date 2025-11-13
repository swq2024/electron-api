const express = require('express');
const { param } = require('express-validator');
const sessionController = require('../controllers/sessionController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// 所有会话路由都需要认证
router.use(authenticate);

// 获取当前用户的活动会话
router.get('/', sessionController.getAll);

// 远程注销指定会话
router.delete('/:id', [
    param('id').isUUID().withMessage('Invalid session ID')
], sessionController.deleteById)

module.exports = router;