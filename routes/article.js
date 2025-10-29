const express = require('express');
const router = express.Router();
const { Article } = require('../models');

router.get('/', async function (req, res) {
  try {
    const condition = {
      order: [['id', 'DESC']],
      limit: 10
    }
    // 查询数据
    const articles = await Article.findAll(condition);

    // 返回查询结果
    res.json({
      status: true,
      message: '查询文章列表成功。',
      data: {
        articles
      }
    });
  } catch (error) {
    res.json({
      status: false,
      message: '查询文章列表失败。',
      errors: error.message
    });
  }
});


module.exports = router;
