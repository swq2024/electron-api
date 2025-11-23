const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticate } = require("../middlewares/auth");
const { validateCaptcha } = require("../middlewares/validation");

const router = express.Router();

// 用户注册 /auth/register
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 6, max: 20 })
      .withMessage("用户名长度必须在6到20个字符之间"),
    body("email").isEmail().withMessage("请输入有效的电子邮件地址"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("密码长度必须至少为8个字符"),
    body("masterPasswordHint")
      .optional()
      .isLength({ max: 255 })
      .withMessage("密码提示长度不能超过255个字符"),
  ],
  validateCaptcha,
  authController.register,
);

// 用户登录 /auth/login
router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("用户名或邮箱不能为空"),
    body("password").notEmpty().withMessage("密码不能为空"),
    body("twoFactorCode")
      .optional()
      .isLength({ min: 6, max: 6 })
      .withMessage("Two-factor code必须是6位数字"),
  ],
  authController.login,
);

// 用户登出 /auth/logout
router.post("/logout", authenticate, authController.logout);

// 刷新令牌 /auth/refresh
router.post(
  "/refresh",
  [body("refreshToken").notEmpty().withMessage("Refresh token is required")],
  authController.refreshToken,
);

// 用户密码重置请求
// router.post('/request-password-reset', [
//     body('email')
//         .isEmail()
//         .withMessage('请输入有效的电子邮件地址'),
// ], authController.requestPasswordReset)

// 重置密码
// router.post('/reset-password/:token', [
//     body('newPassword')
//         .notEmpty()
//         .withMessage('新密码不能为空')
//         .isLength({ min: 8 })
//         .withMessage('密码长度必须至少为8个字符'),
// ], authController.resetPassword)

module.exports = router;
