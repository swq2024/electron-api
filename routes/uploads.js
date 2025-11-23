const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const uploadController = require("../controllers/uploadController");

router.use(authenticate);

router.post("/", uploadController.upload);

module.exports = router;
