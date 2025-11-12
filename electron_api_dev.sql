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

 Date: 13/11/2025 02:16:39
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
INSERT INTO `categories` VALUES ('9b7df1bd-14bf-4e4b-a2ed-8aebbf2b597a', 'd2e74455-066d-427e-aab8-caf7f6cb760d', '社交媒体123', '#3498db', 'folder', 1, '2025-11-13 01:55:43', '2025-11-13 02:08:58');
INSERT INTO `categories` VALUES ('fa187f61-9200-4327-8e91-b45ea987cdab', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'General', '#95a5a6', 'folder', 0, '2025-11-13 01:43:10', '2025-11-13 02:08:58');

-- ----------------------------
-- Table structure for passwordhistories
-- ----------------------------
DROP TABLE IF EXISTS `passwordhistories`;
CREATE TABLE `passwordhistories`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `password_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `encrypted_password` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `changed_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
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
  `action` enum('login','logout','login_failed','password_changed','password_accessed','password_created','password_updated','password_deleted','account_created','account_locked','account_unlocked','profile_updated','two_factor_enabled','two_factor_disabled','export_data','import_data','user_role_updated','user_enabled','user_disabled','default_category_changed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `details` json NULL,
  `ip_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `user_agent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `timestamp` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of securitylogs
-- ----------------------------
INSERT INTO `securitylogs` VALUES ('25964f78-0dc6-47ca-8b16-7b0f884ba4db', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 01:44:00');
INSERT INTO `securitylogs` VALUES ('91634072-c23b-407a-98dc-9465372d4ccf', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'default_category_changed', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"newDefaultCategoryId\": \"9b7df1bd-14bf-4e4b-a2ed-8aebbf2b597a\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 02:08:58');
INSERT INTO `securitylogs` VALUES ('91805ce7-080b-4f05-87d6-de0e2454c8f6', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'account_created', '{\"source\": \"system_seeder\"}', '127.0.0.1', 'System Seeder', '2025-11-13 01:43:10');
INSERT INTO `securitylogs` VALUES ('d7463474-d876-45d4-bda8-b8f0d981a5ff', 'Category', 'default_category_changed', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"newDefaultCategoryId\": \"9b7df1bd-14bf-4e4b-a2ed-8aebbf2b597a\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 01:59:56');
INSERT INTO `securitylogs` VALUES ('e87b0e3a-d3ed-4344-8e6d-4692cd4a36f7', 'd2e74455-066d-427e-aab8-caf7f6cb760d', 'default_category_changed', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"newDefaultCategoryId\": \"fa187f61-9200-4327-8e91-b45ea987cdab\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-13 02:07:33');

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
INSERT INTO `sessions` VALUES ('80ad99d3-0571-4658-963d-de06237abca7', 'd2e74455-066d-427e-aab8-caf7f6cb760d', '95b9c735-7770-4bed-aab2-b22ca1d13c7d', '{\"os\": \"undefined undefined\", \"type\": \"Desktop\", \"browser\": \"Unknown Browser\", \"osVersion\": \"\", \"browserVersion\": \"\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-20 01:44:00', 1, '2025-11-13 01:44:00', '2025-11-13 01:44:00');

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
INSERT INTO `users` VALUES ('d2e74455-066d-427e-aab8-caf7f6cb760d', 'admin', 'admin@yuhuo.com', '$2b$10$kAdeU5z.xrQ5BXfRpce43.34i3N8X/Mt3fIw4wTWjQepioIVrEchG', 'd7d21cd6d80c0e837db0455960eecd24', 'admin', 1, '2025-11-13 01:44:00', 0, NULL, NULL, 0, NULL, '2025-11-13 01:43:10', '2025-11-13 01:44:00');

SET FOREIGN_KEY_CHECKS = 1;
