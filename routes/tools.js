const express = require('express');
const multer = require('multer');

const passwordGeneratorConroller = require('../controllers/passwordGeneratorController');
const importExportController = require('../controllers/importExportController');
const { authenticate } = require('../middlewares/auth')

const router = express.Router();

// 所有工具路由都需要认证
router.use(authenticate);

// 密码生成器路由
router.post('/passwordGenerator', passwordGeneratorConroller.generate);

// 密码导出
router.get('/export', importExportController.export);


// 密码导入
const upload = multer({ dest: 'uploads/' });
router.post('/import', upload.single('file'), importExportController.import);

module.exports = router;