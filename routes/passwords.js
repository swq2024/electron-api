const express = require('express');
const { body, param, query } = require('express-validator');
const passwordController = require('../controllers/passwordController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// 所有密码路由都需要认证
router.use(authenticate);

// 创建密码存储记录
router.post('/', [
    body('title')
        .notEmpty().withMessage('Title is required'),
    body('password')
        .notEmpty().withMessage('Password is required'),
    body('categoryId')
        .optional().isUUID().withMessage('Category ID must be a valid UUID if provided'),
    body('username')
        .optional().isLength({ max: 255 }).withMessage('Username must be less than 255 characters'),
    body('url')
        .optional().isURL().withMessage('Invalid URL'),
    body('notes')
        .optional().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters'),
    body('customFields')
        .optional().isObject().withMessage('Custom fields must be an object')
], passwordController.create);

// 获取所有密码存储列表
router.get('/', [
    query('categoryId')
        .optional().isUUID().withMessage('Category ID must be a valid UUID if provided'),
    query('search')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search term must be between 1 and 100 characters'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('sortBy')
        .optional()
        .isIn(['title', 'username', 'url', 'createdAt', 'updatedAt', 'lastUsed'])
        .withMessage('Invalid sort field'),
    query('sortOrder')
        .optional()
        .isIn(['ASC', 'DESC'])
        .withMessage('Sort order must be ASC or DESC')
], passwordController.getAll);

// 获取单个密码存储详情
router.get('/:id', [
    param('id')
        .isUUID()
        .withMessage('Password ID must be a valid UUID')
], passwordController.getById);

// 更新密码存储记录
router.put('/:id', [
    param('id')
        .isUUID()
        .withMessage('Password ID must be a valid UUID'),
    body('title')
        .optional()
        .notEmpty()
        .withMessage('Title cannot be empty'),
    body('password')
        .optional()
        .notEmpty()
        .withMessage('Password cannot be empty'),
    body('categoryId')
        .optional()
        .isUUID()
        .withMessage('Category ID must be a valid UUID'),
    body('username')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Username must be less than 255 characters'),
    body('url')
        .optional()
        .isURL()
        .withMessage('URL must be a valid URL'),
    body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Notes must be less than 1000 characters'),
    body('customFields')
        .optional()
        .isObject()
        .withMessage('Custom fields must be an object')
], passwordController.update);

// 删除密码存储记录
router.delete('/:id', [
    param('id')
        .isUUID()
        .withMessage('Password ID must be a valid UUID')
], passwordController.delete);

// 获取密码历史记录
router.get('/:id/history', [
    param('id')
        .isUUID()
        .withMessage('Password ID must be a valid UUID')
], passwordController.getHistory);

module.exports = router;