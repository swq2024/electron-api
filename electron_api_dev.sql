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

 Date: 14/11/2025 00:57:52
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
INSERT INTO `categories` VALUES ('58166c74-4075-411d-a62f-0dc760c47ca5', 'd2e74455-066d-427e-aab8-caf7f6cb760d', '游戏平台', '#3498db', 'folder', 0, '2025-11-13 17:39:37', '2025-11-13 17:39:37');
INSERT INTO `categories` VALUES ('9b7df1bd-14bf-4e4b-a2ed-8aebbf2b597a', 'd2e74455-066d-427e-aab8-caf7f6cb760d', '社交媒体123', '#3498db', 'folder', 0, '2025-11-13 01:55:43', '2025-11-13 16:48:52');
INSERT INTO `categories` VALUES ('fa187f61-9200-4327-8e91-b45ea987cdab', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'General', '#95a5a6', 'folder', 1, '2025-11-13 01:43:10', '2025-11-13 16:48:52');

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
INSERT INTO `passwords` VALUES ('2ce41241-81e9-4346-af0c-1b1f1bc66cc8', 'd2e74455-066d-427e-aab8-caf7f6cb760d', '58166c74-4075-411d-a62f-0dc760c47ca5', 'Steam 账号', '', '6167840b5fd2ed5496ff2d9f58b4fd96:673086f1ed8964e077db8c4bb4fa5f25', '', '', 0, NULL, '{}', 3, NULL, NULL, '2025-11-13 19:51:43', '2025-11-13 19:51:43');

-- ----------------------------
-- Table structure for securitylogs
-- ----------------------------
DROP TABLE IF EXISTS `securitylogs`;
CREATE TABLE `securitylogs`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `action` enum('login','logout','login_failed','password_changed','password_accessed','password_created','password_updated','password_deleted','account_created','account_locked','account_unlocked','profile_updated','two_factor_enabled','two_factor_disabled','export_data','import_data','user_role_updated','user_enabled','user_disabled','default_category_changed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
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
INSERT INTO `securitylogs` VALUES ('07a5b0a4-145e-454c-ab0f-ecfedbd16f3f', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 20:32:49', NULL);
INSERT INTO `securitylogs` VALUES ('17d0154a-d5d6-4233-a4d7-411517742f02', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'logout', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 20:52:53', NULL);
INSERT INTO `securitylogs` VALUES ('22cecc01-ef30-48e7-abf1-fe9bb998c2bc', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 20:11:23', NULL);
INSERT INTO `securitylogs` VALUES ('2433a94f-d02f-41c5-b1e5-6c8a5984a091', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 20:32:30', NULL);
INSERT INTO `securitylogs` VALUES ('40a36f1a-11c5-4f27-b6c0-77a9491702da', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 20:27:15', NULL);
INSERT INTO `securitylogs` VALUES ('48d401fb-130a-46a0-bf05-43afb080b6f0', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 21:16:04', NULL);
INSERT INTO `securitylogs` VALUES ('4cee81bc-4288-4b9a-80a7-eec5b3c379eb', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 20:30:49', NULL);
INSERT INTO `securitylogs` VALUES ('57c0dbe7-73e5-4751-a311-cc7d895daa1b', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 21:15:09', NULL);
INSERT INTO `securitylogs` VALUES ('5fe340f2-2b31-418d-a502-cb17130c6c14', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'import_data', '{\"ip\": \"::1\", \"count\": 1, \"format\": \"json\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 19:51:43', NULL);
INSERT INTO `securitylogs` VALUES ('9c8e6289-9dbe-4881-9e40-bd0491f15dd3', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 20:28:45', NULL);
INSERT INTO `securitylogs` VALUES ('a18b002e-2aca-4d00-a234-d375c9921996', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 20:25:57', NULL);
INSERT INTO `securitylogs` VALUES ('a1e04adf-7a64-41bb-99b1-9f5296647c88', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'logout', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 20:42:27', NULL);
INSERT INTO `securitylogs` VALUES ('c5d556e3-4250-4cc9-bc68-1f832f3f72e0', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 20:19:25', NULL);
INSERT INTO `securitylogs` VALUES ('c789c652-d878-4071-a544-ea9707f14a2c', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'logout', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 20:11:28', NULL);
INSERT INTO `securitylogs` VALUES ('dd310ba3-b5b1-47e3-bb23-4982f8d33e38', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 20:45:06', NULL);
INSERT INTO `securitylogs` VALUES ('e3b346ac-c452-43c8-ab9c-fb817588ab92', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 20:25:24', NULL);

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
INSERT INTO `sequelizemeta` VALUES ('20251112012812-add-jti-to-session.js');
INSERT INTO `sequelizemeta` VALUES ('20251112032354-add-deleted-at-to-password.js');
INSERT INTO `sequelizemeta` VALUES ('20251113110726-add-password-id-to-security-log.js');
INSERT INTO `sequelizemeta` VALUES ('20251113113100-add-password-cascade-constraints.js');

-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `jti` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'JWT ID',
  `device_info` json NULL COMMENT '设备信息',
  `ip_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '登录IP',
  `user_agent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '用户代理',
  `expires_at` datetime NULL DEFAULT NULL COMMENT '过期时间',
  `is_active` tinyint(1) NULL DEFAULT 1 COMMENT '是否活跃',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `jti`(`jti` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sessions
-- ----------------------------
INSERT INTO `sessions` VALUES ('136995ba-ba55-43a0-91d1-ae25f4e9e131', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'a5a4a249-3599-480a-adb8-7895cc97876c', '{\"os\": \"undefined undefined\", \"type\": \"Desktop\", \"browser\": \"Unknown Browser\", \"osVersion\": \"\", \"browserVersion\": \"\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-20 20:45:06', 0, '2025-11-13 20:45:06', '2025-11-13 20:52:53');
INSERT INTO `sessions` VALUES ('6aef8fbc-bb96-44dd-8952-24f7520ec579', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'eb0ea9a7-4cdd-432d-903d-2fefba5ab735', '{\"os\": \"undefined undefined\", \"type\": \"Desktop\", \"browser\": \"Unknown Browser\", \"osVersion\": \"\", \"browserVersion\": \"\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-20 21:16:04', 1, '2025-11-13 21:16:04', '2025-11-13 21:16:04');
INSERT INTO `sessions` VALUES ('9993ce02-f28e-4312-b73e-098281826dea', 'd2e74455-066d-427e-aab8-caf7f6cb760d', '3753de26-dcbe-4f93-a740-40947cd56b58', '{\"os\": \"undefined undefined\", \"type\": \"Desktop\", \"browser\": \"Unknown Browser\", \"osVersion\": \"\", \"browserVersion\": \"\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-20 20:32:29', 1, '2025-11-13 20:32:30', '2025-11-13 20:32:30');
INSERT INTO `sessions` VALUES ('9fb3f0c7-f66f-4084-bc73-5e8b95f42922', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'eec008cd-6672-4d37-8b80-9a641c4d736e', '{\"os\": \"undefined undefined\", \"type\": \"Desktop\", \"browser\": \"Unknown Browser\", \"osVersion\": \"\", \"browserVersion\": \"\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-20 21:15:09', 1, '2025-11-13 21:15:09', '2025-11-13 21:15:09');
INSERT INTO `sessions` VALUES ('bd5f90c3-89ad-41ba-9817-e79f4947abe2', 'd2e74455-066d-427e-aab8-caf7f6cb760d', '48ba7061-b5a8-4af5-8ac5-a9d6aa6e2cdf', '{\"os\": \"undefined undefined\", \"type\": \"Desktop\", \"browser\": \"Unknown Browser\", \"osVersion\": \"\", \"browserVersion\": \"\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-20 20:32:49', 0, '2025-11-13 20:32:49', '2025-11-13 20:41:16');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '由于该字段为UUID，所以需要设置为BINARY(16)，这样可以减少存储空间并提高索引性能',
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `salt` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
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
INSERT INTO `users` VALUES ('d2e74455-066d-427e-aab8-caf7f6cb760d', 'admin', 'admin@yuhuo.com', '$2b$10$kAdeU5z.xrQ5BXfRpce43.34i3N8X/Mt3fIw4wTWjQepioIVrEchG', 'd7d21cd6d80c0e837db0455960eecd24', 'admin', 1, '2025-11-13 21:16:04', 0, NULL, NULL, 0, NULL, '2025-11-13 01:43:10', '2025-11-13 21:16:04');

SET FOREIGN_KEY_CHECKS = 1;
