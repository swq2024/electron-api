const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
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

module.exports = router;
