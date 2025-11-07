const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/', function (req, res, next) {
  res.json({
    message: 'Hello, World!',
  });
});

router.post('/api/record-click', (req, res) => {
  const data = { ...req.body, ip: req.ip };

  const { target, ip } = req.body;
  const key = `${ip}-${target}`;
  const now = Date.now();
  const lastTime = clickCache.get(key) || 0;
  // 同一 IP 对同一目标链接的点击，10 秒内只记录一次
  if (now - lastTime > 10000) { // 10秒内不重复记录
    clickCache.set(key, now);
    // 存储数据...
    // 存储到 JSON 文件（生产环境建议用数据库）
    fs.appendFile('click-logs.json', JSON.stringify(data) + ',\n', (err) => {
      if (err) console.error('存储失败:', err);
    });
  }

  res.sendStatus(200);
});

module.exports = router;
