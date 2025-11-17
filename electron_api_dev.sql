/*
 Navicat Premium Dump SQL

 Source Server         : root
 Source Server Type    : MySQL
 Source Server Version : 80043 (8.0.43)
 Source Host           : localhost:3306
 Source Schema         : electron_api_dev

 Target Server Type    : MySQL
 Target Server Version : 80043 (8.0.43)
 File Encoding         : 65001

 Date: 17/11/2025 23:38:14
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '关联的用户ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '分类名称',
  `color` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '#3498db' COMMENT '分类颜色',
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'folder' COMMENT '分类图标, 默认为文件夹图标',
  `is_default` tinyint(1) NULL DEFAULT 0 COMMENT '是否为默认分类',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES ('a06a19b2-ffef-44d4-9eed-730cbdec53a7', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', '游戏平台', '#3498db', 'folder', 0, '2025-11-17 18:42:46', '2025-11-17 23:26:54');
INSERT INTO `categories` VALUES ('fabb1853-fe14-4c1a-a6f5-a9afe6b86f1e', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'General', '#95a5a6', 'folder', 1, '2025-11-16 01:45:45', '2025-11-17 23:26:54');

-- ----------------------------
-- Table structure for logs
-- ----------------------------
DROP TABLE IF EXISTS `logs`;
CREATE TABLE `logs`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `level` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `message` varchar(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `meta` varchar(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of logs
-- ----------------------------
INSERT INTO `logs` VALUES (1, 'error', '服务器未知错误: log is not defined', '{\"service\":\"keyVault-log-service\",\"stack\":\"ReferenceError: log is not defined\\n    at changePassword (F:\\\\electron\\\\backend-service\\\\controllers\\\\userController.js:130:13)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\"}', '2025-11-17 18:35:39');
INSERT INTO `logs` VALUES (2, 'error', '服务器未知错误: Assignment to constant variable.', '{\"service\":\"keyVault-log-service\",\"stack\":\"TypeError: Assignment to constant variable.\\n    at generate (F:\\\\electron\\\\backend-service\\\\controllers\\\\passwordGeneratorController.js:47:26)\\n    at Layer.handle [as handle_request] (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\layer.js:95:5)\\n    at next (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\route.js:137:13)\\n    at Route.dispatch (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\route.js:112:3)\\n    at Layer.handle [as handle_request] (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\layer.js:95:5)\\n    at F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\index.js:281:22\\n    at Function.process_params (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\index.js:335:12)\\n    at next (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\index.js:275:10)\\n    at authenticate (F:\\\\electron\\\\backend-service\\\\middlewares\\\\auth.js:95:9)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\"}', '2025-11-17 23:14:57');

-- ----------------------------
-- Table structure for passwordhistories
-- ----------------------------
DROP TABLE IF EXISTS `passwordhistories`;
CREATE TABLE `passwordhistories`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `password_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `encrypted_password` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `changed_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_password_history_password_id`(`password_id` ASC) USING BTREE,
  CONSTRAINT `fk_password_history_password_id` FOREIGN KEY (`password_id`) REFERENCES `passwords` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of passwordhistories
-- ----------------------------

-- ----------------------------
-- Table structure for passwords
-- ----------------------------
DROP TABLE IF EXISTS `passwords`;
CREATE TABLE `passwords`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '关联的用户ID',
  `category_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT '关联的分类ID',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '密码所属应用名称',
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '应用登录用户名',
  `encrypted_password` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '加密后的密码',
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '应用网址',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '备注信息',
  `is_favorite` tinyint(1) NULL DEFAULT 0 COMMENT '是否为收藏',
  `deletedAt` datetime NULL DEFAULT NULL,
  `custom_fields` json NULL COMMENT '自定义字段',
  `password_strength` int NULL DEFAULT 0 COMMENT '密码强度',
  `last_used` datetime NULL DEFAULT NULL COMMENT '最后一次使用时间',
  `expires_at` datetime NULL DEFAULT NULL COMMENT '密码过期时间',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `passwords_deleted_at`(`deletedAt` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of passwords
-- ----------------------------

-- ----------------------------
-- Table structure for securitylogs
-- ----------------------------
DROP TABLE IF EXISTS `securitylogs`;
CREATE TABLE `securitylogs`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `action` enum('login','logout','login_failed','password_accessed','password_created','password_updated','password_deleted','account_created','account_locked','account_unlocked','profile_updated','two_factor_enabled','two_factor_disabled','export_data','import_data','user_role_updated','user_enabled','user_disabled','default_category_changed','token_refreshed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `details` json NULL,
  `ip_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `user_agent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `timestamp` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `password_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_security_logs_password_id`(`password_id` ASC) USING BTREE,
  CONSTRAINT `fk_security_logs_password_id` FOREIGN KEY (`password_id`) REFERENCES `passwords` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of securitylogs
-- ----------------------------
INSERT INTO `securitylogs` VALUES ('0bdc0e32-b995-45ac-898e-abdaa8bd90b6', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-17 14:53:15', NULL);
INSERT INTO `securitylogs` VALUES ('10492c91-4b97-419d-b971-7cd1a14f3345', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'export_data', '{\"ip\": \"::1\", \"count\": 0, \"format\": \"json\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-17 18:42:35', NULL);
INSERT INTO `securitylogs` VALUES ('25aa086f-73dd-457b-ab1c-11690ae95dea', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'login', '{\"ip\": \"::1\", \"reason\": \"successful login[first login]\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-16 20:23:58', NULL);
INSERT INTO `securitylogs` VALUES ('271d13b2-1da4-499f-bdf3-bd63f8fe2e45', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'import_data', '{\"ip\": \"::1\", \"count\": 1, \"format\": \"json\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-17 18:42:46', NULL);
INSERT INTO `securitylogs` VALUES ('3853ef75-f1e5-4962-b58e-5e2f38629095', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'default_category_changed', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"newDefaultCategoryId\": \"a06a19b2-ffef-44d4-9eed-730cbdec53a7\", \"oldDefaultCategoryId\": \"fabb1853-fe14-4c1a-a6f5-a9afe6b86f1e\", \"transferredPasswordCount\": 0}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-17 23:26:17', NULL);
INSERT INTO `securitylogs` VALUES ('3a38c42a-c331-4119-8b7a-2f0dad5e9c88', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-17 13:21:20', NULL);
INSERT INTO `securitylogs` VALUES ('3c8cda2a-64aa-440e-b583-228a7a0ae0dc', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-16 22:02:31', NULL);
INSERT INTO `securitylogs` VALUES ('4b82f7d5-b5eb-4e57-a519-fa2535f68cc0', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-16 22:02:00', NULL);
INSERT INTO `securitylogs` VALUES ('57e7083d-e39f-4a04-8368-81776036661e', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-16 22:17:27', NULL);
INSERT INTO `securitylogs` VALUES ('593d1dd0-68a1-4b54-b699-e99c0d50a478', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-17 13:21:35', NULL);
INSERT INTO `securitylogs` VALUES ('8387644b-1b74-4fab-890e-0376297a0323', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'default_category_changed', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"newDefaultCategoryId\": \"fabb1853-fe14-4c1a-a6f5-a9afe6b86f1e\", \"oldDefaultCategoryId\": \"a06a19b2-ffef-44d4-9eed-730cbdec53a7\", \"transferredPasswordCount\": 2}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-17 23:26:54', NULL);
INSERT INTO `securitylogs` VALUES ('8609dd27-4c54-4cff-a2de-449fe6df5c9b', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-16 23:22:25', NULL);
INSERT INTO `securitylogs` VALUES ('8e6e6832-48d4-4d07-8bb3-d9f0873fa3e8', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-16 22:02:15', NULL);
INSERT INTO `securitylogs` VALUES ('9b3eef36-7c50-401d-a5fd-934b3124eca1', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'password_updated', '{\"ip\": \"::1\", \"reason\": \"User changed password. Current token version: 1 -> New token version: 2\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-17 18:36:11', NULL);
INSERT INTO `securitylogs` VALUES ('a6e92d62-75b7-4d9f-b486-520df34ad0e3', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-16 23:07:50', NULL);
INSERT INTO `securitylogs` VALUES ('b0c37c69-f1b4-4c5c-8050-65a2a5cda1d9', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'logout', '{\"ip\": \"::1\", \"reason\": \"User requested logout\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-16 21:23:24', NULL);
INSERT INTO `securitylogs` VALUES ('ca31d7d9-04f6-4a6a-8791-c902024570c0', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-16 22:01:31', NULL);
INSERT INTO `securitylogs` VALUES ('cd4f6c80-8a91-4ec2-b810-d011c8c09820', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'user_enabled', '{\"ip\": \"::1\", \"newStatus\": \"active\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"targetUserId\": \"7f9e2932-a0d5-4df8-aaaa-166ad9b66600\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-17 23:23:11', NULL);
INSERT INTO `securitylogs` VALUES ('d029385f-1ba9-4127-bcf7-3f2cf32b9af0', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'export_data', '{\"ip\": \"::1\", \"count\": 1, \"format\": \"json\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-17 18:44:02', NULL);
INSERT INTO `securitylogs` VALUES ('e1df05c9-573e-4b22-b88f-af4ba48179cf', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-17 14:43:28', NULL);
INSERT INTO `securitylogs` VALUES ('eff46876-c4f3-4b65-b3e9-cfb5e46327c2', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-16 22:02:57', NULL);

-- ----------------------------
-- Table structure for sequelizemeta
-- ----------------------------
DROP TABLE IF EXISTS `sequelizemeta`;
CREATE TABLE `sequelizemeta`  (
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sequelizemeta
-- ----------------------------
INSERT INTO `sequelizemeta` VALUES ('20251029100803-create-article.js');
INSERT INTO `sequelizemeta` VALUES ('20251111024915-create-user.js');
INSERT INTO `sequelizemeta` VALUES ('20251111031402-create-password.js');
INSERT INTO `sequelizemeta` VALUES ('20251111032930-create-category.js');
INSERT INTO `sequelizemeta` VALUES ('20251111033514-create-password-history.js');
INSERT INTO `sequelizemeta` VALUES ('20251111033833-create-session.js');
INSERT INTO `sequelizemeta` VALUES ('20251111034253-create-security-log.js');
INSERT INTO `sequelizemeta` VALUES ('20251112032354-add-deleted-at-to-password.js');
INSERT INTO `sequelizemeta` VALUES ('20251113110726-add-password-id-to-security-log.js');
INSERT INTO `sequelizemeta` VALUES ('20251113113100-add-password-cascade-constraints.js');
INSERT INTO `sequelizemeta` VALUES ('20251114052726-add-auth-fields-to-user.js');
INSERT INTO `sequelizemeta` VALUES ('20251114063604-remove-salt-from-user.js');
INSERT INTO `sequelizemeta` VALUES ('20251115132153-add-jti-to-session.js');
INSERT INTO `sequelizemeta` VALUES ('20251115152245-add-rtExpires-at-to-session.js');
INSERT INTO `sequelizemeta` VALUES ('20251117102818-create-log.js');

-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `jti` json NOT NULL COMMENT 'JSON object containing { at: \"at_jti\", rt: \"rt_jti\" }',
  `device_info` json NULL COMMENT '设备信息',
  `ip_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '登录IP',
  `user_agent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '用户代理',
  `expires_at` datetime NULL DEFAULT NULL COMMENT 'AT过期时间',
  `rt_expires_at` datetime NULL DEFAULT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1 COMMENT '是否活跃',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sessions
-- ----------------------------
INSERT INTO `sessions` VALUES ('47a24068-ca06-45fa-a0d2-0c8ceaa46566', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', '\"{\\\"at\\\":\\\"1b8dff9b-57de-40d7-b576-5f7b85aebbf2\\\",\\\"rt\\\":\\\"a6906149-34b5-4add-b21e-82fcc236d551\\\"}\"', '{\"os\": \"undefined undefined\", \"type\": \"Desktop\", \"browser\": \"Unknown Browser\", \"osVersion\": \"\", \"browserVersion\": \"\", \"deviceFingerprint\": \"undefined undefined\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-17 23:51:00', '2025-11-24 23:31:00', 1, '2025-11-16 20:23:58', '2025-11-17 23:31:00');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '由于该字段为UUID，所以需要设置为BINARY(16)，这样可以减少存储空间并提高索引性能',
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `token_version` int NOT NULL DEFAULT 1,
  `refresh_token_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `role` enum('user','admin','vip') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'user',
  `is_active` tinyint(1) NULL DEFAULT 1,
  `last_login` datetime NULL DEFAULT NULL,
  `failed_login_attempts` int NULL DEFAULT 0,
  `locked_until` datetime NULL DEFAULT NULL,
  `master_password_hint` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `two_factor_enabled` tinyint(1) NULL DEFAULT 0,
  `two_factor_secret` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'admin123', 'admin@example.com', '$2b$10$gHUT7vO.ygGjpjvQrPxRNuJF1KM.dLVpprHsLZpQ5hRMXuspYT7CO', 2, '$2b$10$TT3oh5wZjCu6kXgLUZ4LkO/2OnZbN6GdbIAc7Sf9UK/cA8O9S0wWS', 'admin', 1, '2025-11-17 18:36:50', 0, NULL, NULL, 0, NULL, '2025-11-16 01:45:45', '2025-11-17 23:31:00');

SET FOREIGN_KEY_CHECKS = 1;
