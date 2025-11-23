const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { authenticate } = require("../middlewares/auth");
const passwordController = require("../controllers/passwordController");

router.use(authenticate);

// 密码收藏/取消收藏
router.post(
  "/",
  [
    body("passwordId")
      .notEmpty()
      .withMessage("Password ID is required")
      .isUUID()
      .withMessage("Invalid password ID"),
  ],
  passwordController.collectPassword,
);

// 用户收藏的密码记录
router.get("/", passwordController.getUserFavoritePasswords);

module.exports = router;
