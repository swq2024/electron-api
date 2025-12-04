const express = require("express");
const router = express.Router();
const { sendOk, sendErr } = require("../utils/response");
const svgCaptcha = require("svg-captcha");
const redisService = require("../services/redisService");
const { v4: uuidv4 } = require("uuid");

/**
 * 获取验证码
 * GET /captcha
 */
router.get("/", async (req, res) => {
  try {
    const captcha = svgCaptcha.create({
      size: 4,
      ignoreChars: "0O1Il9quv",
      fontSize: 50,
      width: 100,
      height: 40,
      background: "#cc9966",
      noise: 3,
      color: true,
    });
    const key = `captcha_${uuidv4()}`;
    await redisService.setEx(key, 60 * 15, captcha.text); // 有效期15分钟
    return sendOk(res, 200, "验证码获取成功", { key, captcha: captcha.data });
  } catch (error) {
    sendErr(res, error);
  }
});

module.exports = router;
