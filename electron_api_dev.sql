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

 Date: 15/11/2025 00:23:39
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
INSERT INTO `categories` VALUES ('4065ee70-1406-4242-bd69-8670a370bc94', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', '游戏平台', '#3498db', 'folder', 0, '2025-11-15 00:02:37', '2025-11-15 00:02:37');
INSERT INTO `categories` VALUES ('58166c74-4075-411d-a62f-0dc760c47ca5', 'd2e74455-066d-427e-aab8-caf7f6cb760d', '游戏平台', '#3498db', 'folder', 0, '2025-11-13 17:39:37', '2025-11-13 17:39:37');
INSERT INTO `categories` VALUES ('5b7e6ae5-3b3e-4f92-bda7-39c72920f68d', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'General', '#95a5a6', 'folder', 1, '2025-11-14 15:57:22', '2025-11-14 15:57:22');
INSERT INTO `categories` VALUES ('9b7df1bd-14bf-4e4b-a2ed-8aebbf2b597a', 'd2e74455-066d-427e-aab8-caf7f6cb760d', '社交媒体123', '#3498db', 'folder', 0, '2025-11-13 01:55:43', '2025-11-13 16:48:52');
INSERT INTO `categories` VALUES ('f7b15020-6c33-47df-87bb-b78f1604ba86', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'General', '#95a5a6', 'folder', 1, '2025-11-14 16:17:33', '2025-11-14 16:17:33');
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
INSERT INTO `passwords` VALUES ('082cec06-944c-4434-a13e-e2f8aef52805', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', '5b7e6ae5-3b3e-4f92-bda7-39c72920f68d', 'GitHub个人账号', NULL, 'eyJzYWx0IjoiNGVhMWIzZjMwM2I1YzRhZjQ4MDQzY2MxNDQ4NDI2Y2YiLCJpdiI6ImFiMzk0ZDQzYThkNTNmYmNhZTZjM2UzM2NlYTc1MzBmIiwiYXV0aFRhZyI6IjljNTI5YTg1N2FiNmQzOTlkNmI5NGM3YzY4NjFjMTFkIiwiZW5jcnlwdGVkRGF0YSI6IjBiY2QzNTI2ODJlYyJ9', NULL, NULL, 0, NULL, '{}', 1, '2025-11-15 00:01:26', NULL, '2025-11-14 23:59:46', '2025-11-15 00:01:49');
INSERT INTO `passwords` VALUES ('2ce41241-81e9-4346-af0c-1b1f1bc66cc8', 'd2e74455-066d-427e-aab8-caf7f6cb760d', '58166c74-4075-411d-a62f-0dc760c47ca5', 'Steam 账号', '', '6167840b5fd2ed5496ff2d9f58b4fd96:673086f1ed8964e077db8c4bb4fa5f25', '', '', 0, NULL, '{}', 3, NULL, NULL, '2025-11-13 19:51:43', '2025-11-13 19:51:43');
INSERT INTO `passwords` VALUES ('3c051012-358d-416e-8d53-c76adcc86c9c', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', '4065ee70-1406-4242-bd69-8670a370bc94', 'Steam 账号123', '', 'eyJzYWx0IjoiZTBhNThhYjA2MzYyZWIwNGZkNmFlZDNhZGFlYzgyNTMiLCJpdiI6ImIzNTZhYzZlYWIwOGVmODllNGZkODJlZjIxZjAyZmViIiwiYXV0aFRhZyI6Ijc3NzRjN2FiY2YwY2Y2M2ZlYTEzNjliZjM4MjlmOGU4IiwiZW5jcnlwdGVkRGF0YSI6ImMyOGMyZDk4NzQ1ZTAwOTU4YWE1YmIifQ==', '', '', 0, NULL, '{}', 3, NULL, NULL, '2025-11-15 00:02:37', '2025-11-15 00:03:10');
INSERT INTO `passwords` VALUES ('f0079902-8fae-4514-8a50-0214fa0d1bfe', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', '5b7e6ae5-3b3e-4f92-bda7-39c72920f68d', 'QQ 账号', NULL, 'eyJzYWx0IjoiNGYzZDczODBiNmNhZWMxYzMwZmM2ZWM2M2MxMTY0MTYiLCJpdiI6IjAxMGY2YzVlM2Q1ODM4MmU2ZTRhOWIzZmU0ODUwMmMzIiwiYXV0aFRhZyI6ImE4Yjk5MjE2NzE4NTQwZjVjNjI0NTcwODQ0OGI1NTk2IiwiZW5jcnlwdGVkRGF0YSI6IjMxZjRkMmQ0NzIxMiJ9', NULL, NULL, 0, NULL, '{}', 1, '2025-11-15 00:23:20', NULL, '2025-11-15 00:22:49', '2025-11-15 00:23:20');

-- ----------------------------
-- Table structure for securitylogs
-- ----------------------------
DROP TABLE IF EXISTS `securitylogs`;
CREATE TABLE `securitylogs`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `action` enum('login','logout','login_failed','password_accessed','password_created','password_updated','password_deleted','account_created','account_locked','account_unlocked','profile_updated','two_factor_enabled','two_factor_disabled','export_data','import_data','user_role_updated','user_enabled','user_disabled','default_category_changed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
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
INSERT INTO `securitylogs` VALUES ('0082e675-b9a0-4d12-89c6-98d5a9fa473e', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 23:11:30', NULL);
INSERT INTO `securitylogs` VALUES ('025ae638-32ec-4d54-890e-a70d9ca4f336', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:01:22', NULL);
INSERT INTO `securitylogs` VALUES ('0a0a21b8-f821-4d52-9cc9-db0423f556cb', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:39:50', NULL);
INSERT INTO `securitylogs` VALUES ('14b78117-9cf5-4120-9757-7efec72355fe', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:01:01', NULL);
INSERT INTO `securitylogs` VALUES ('14c57828-d3d6-4de2-8a23-06342090df45', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'password_updated', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"passwordId\": \"082cec06-944c-4434-a13e-e2f8aef52805\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-15 00:01:42', '082cec06-944c-4434-a13e-e2f8aef52805');
INSERT INTO `securitylogs` VALUES ('193c38d1-e2ef-4dad-9b9f-ac335739a1b5', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 23:01:36', NULL);
INSERT INTO `securitylogs` VALUES ('196cef38-3184-478b-af7d-82cebfdeb3d5', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 20:27:39', NULL);
INSERT INTO `securitylogs` VALUES ('20efe932-52a3-4b5a-b940-cf140cfdd3dd', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 23:41:59', NULL);
INSERT INTO `securitylogs` VALUES ('224ad0f0-dfe0-45bd-93de-5bac5da7fdf4', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'user_role_updated', '{\"ip\": \"::1\", \"newRole\": \"user\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"targetUserId\": \"4f49e5a4-c056-4d6d-87b8-2d3b7e62d658\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 23:43:26', NULL);
INSERT INTO `securitylogs` VALUES ('2c3f31f8-1e71-4d2f-bed3-b4c411ae1cdd', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:24:17', NULL);
INSERT INTO `securitylogs` VALUES ('2e160832-6d89-4b6e-9daf-4b20683c0a41', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:16:09', NULL);
INSERT INTO `securitylogs` VALUES ('303ea58d-fe39-401f-84c9-fa0ac878edf7', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 16:27:43', NULL);
INSERT INTO `securitylogs` VALUES ('3040c8d5-396d-4c14-a2b8-a08ec11b8325', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 21:53:39', NULL);
INSERT INTO `securitylogs` VALUES ('32044662-092d-4f23-a16e-4773b8783431', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-15 00:22:41', NULL);
INSERT INTO `securitylogs` VALUES ('37f06351-87f6-4056-974a-5b4fc2bf32bd', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:42:01', NULL);
INSERT INTO `securitylogs` VALUES ('3ac908d9-3928-477a-8284-089f0a37432d', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:00:25', NULL);
INSERT INTO `securitylogs` VALUES ('3bbbc38c-983e-4326-8456-29c2f251f0c3', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:14:27', NULL);
INSERT INTO `securitylogs` VALUES ('4258d12a-3307-4502-a88f-d79414d653e7', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:20:59', NULL);
INSERT INTO `securitylogs` VALUES ('499131c8-1dbb-4f5e-8d8f-0179f1c7985c', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 23:08:38', NULL);
INSERT INTO `securitylogs` VALUES ('5284f622-44cc-4fca-82f8-3df785c064ed', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'account_created', '{\"source\": \"system_seeder\"}', '127.0.0.1', 'System Seeder', '2025-11-14 15:57:22', NULL);
INSERT INTO `securitylogs` VALUES ('5c878901-e799-46cf-a466-9e6c49214dc9', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 23:59:42', NULL);
INSERT INTO `securitylogs` VALUES ('5d7664e1-e1be-4e2b-ae92-28b35d576267', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 21:57:33', NULL);
INSERT INTO `securitylogs` VALUES ('6e21bb03-ba09-4b88-a9e0-c10415e07080', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:01:32', NULL);
INSERT INTO `securitylogs` VALUES ('723dbbcd-f31c-4ef4-a66b-c48cabf386f3', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'user_role_updated', '{\"ip\": \"::1\", \"newRole\": \"vip\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"targetUserId\": \"4f49e5a4-c056-4d6d-87b8-2d3b7e62d658\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 23:42:42', NULL);
INSERT INTO `securitylogs` VALUES ('725889a3-e01f-4a02-951d-28f6cd3d8be6', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'user_disabled', '{\"ip\": \"::1\", \"newStatus\": \"inactive\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"targetUserId\": \"4f49e5a4-c056-4d6d-87b8-2d3b7e62d658\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 23:42:58', NULL);
INSERT INTO `securitylogs` VALUES ('75869bfd-bff3-4b52-bc0c-a551fa43afe3', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:17:28', NULL);
INSERT INTO `securitylogs` VALUES ('77786893-3f1c-40d2-9da6-1c2bb1e612c9', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'password_created', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"passwordId\": \"f0079902-8fae-4514-8a50-0214fa0d1bfe\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-15 00:22:49', 'f0079902-8fae-4514-8a50-0214fa0d1bfe');
INSERT INTO `securitylogs` VALUES ('786ef6f4-8e1e-42b0-858d-d66440a6b69d', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 21:59:54', NULL);
INSERT INTO `securitylogs` VALUES ('7e3a5c2d-6404-47a2-92b6-8b09266c538e', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'password_created', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"passwordId\": \"082cec06-944c-4434-a13e-e2f8aef52805\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 23:59:46', '082cec06-944c-4434-a13e-e2f8aef52805');
INSERT INTO `securitylogs` VALUES ('8461a217-1c00-48f5-8a10-a4528b58d9ca', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login_failed', '{\"ip\": \"::1\", \"reason\": \"invalid_password\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 16:38:18', NULL);
INSERT INTO `securitylogs` VALUES ('84ecd940-c7ce-4c5b-9da1-c5a7bf1168e0', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 21:45:53', NULL);
INSERT INTO `securitylogs` VALUES ('88b579d7-81ea-4e12-8e8f-1978353f6bb2', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:57:53', NULL);
INSERT INTO `securitylogs` VALUES ('89364a90-8fe2-4fc0-ac69-59465ebd54f2', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 16:32:23', NULL);
INSERT INTO `securitylogs` VALUES ('8b5f20f8-865d-4499-81e7-680262f38b7f', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 23:00:36', NULL);
INSERT INTO `securitylogs` VALUES ('8e24fc4c-340f-4e31-baa1-bcdfb22353d0', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:52:29', NULL);
INSERT INTO `securitylogs` VALUES ('9a4415dc-27b9-4ac9-b6be-823932c55a8f', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'user_enabled', '{\"ip\": \"::1\", \"newStatus\": \"active\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"targetUserId\": \"4f49e5a4-c056-4d6d-87b8-2d3b7e62d658\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 23:43:07', NULL);
INSERT INTO `securitylogs` VALUES ('9b3334e9-eea1-484e-9e76-9e835b89cf14', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'password_updated', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"passwordId\": \"082cec06-944c-4434-a13e-e2f8aef52805\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-15 00:01:49', '082cec06-944c-4434-a13e-e2f8aef52805');
INSERT INTO `securitylogs` VALUES ('9ba78f71-2452-4ac2-8dfa-2635d571244b', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 16:19:56', NULL);
INSERT INTO `securitylogs` VALUES ('a9b1e628-7bd5-4963-a2bc-b3e3e3f08913', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 21:39:00', NULL);
INSERT INTO `securitylogs` VALUES ('adef1f0e-e516-497a-abf5-66fac3240d5a', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 16:30:40', NULL);
INSERT INTO `securitylogs` VALUES ('b8220633-4048-45d7-83a5-e8d76f964ddd', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'password_accessed', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"passwordId\": \"082cec06-944c-4434-a13e-e2f8aef52805\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-15 00:01:26', '082cec06-944c-4434-a13e-e2f8aef52805');
INSERT INTO `securitylogs` VALUES ('b9aff0d8-25a4-42e4-9902-ef68d189b1b8', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:44:29', NULL);
INSERT INTO `securitylogs` VALUES ('bba80ccf-88b6-43d8-a009-7c3afa382950', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:25:14', NULL);
INSERT INTO `securitylogs` VALUES ('be3fba92-b2e7-4512-a6be-03bb86bd857a', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:01:08', NULL);
INSERT INTO `securitylogs` VALUES ('c1ffeabc-f272-47c0-826a-e8a4ea2f2754', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'import_data', '{\"ip\": \"::1\", \"count\": 1, \"format\": \"json\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-15 00:02:37', NULL);
INSERT INTO `securitylogs` VALUES ('cfbe7515-fecf-43a1-9556-f56af657bec6', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 21:51:36', NULL);
INSERT INTO `securitylogs` VALUES ('d2dddd04-f585-447c-b8f9-9c94a87989fa', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 21:39:33', NULL);
INSERT INTO `securitylogs` VALUES ('d4c38844-650f-4a24-bfc3-2a0214201cd3', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'password_accessed', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"passwordId\": \"f0079902-8fae-4514-8a50-0214fa0d1bfe\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-15 00:23:20', 'f0079902-8fae-4514-8a50-0214fa0d1bfe');
INSERT INTO `securitylogs` VALUES ('d962018f-9c08-4b6e-9795-de6cd6ddce28', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 21:59:34', NULL);
INSERT INTO `securitylogs` VALUES ('dc863af8-d17b-40dd-84c4-b08fec3dbdfc', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 20:27:28', NULL);
INSERT INTO `securitylogs` VALUES ('def725a3-eb5f-41ae-8bda-4b7481e82f51', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 20:31:43', NULL);
INSERT INTO `securitylogs` VALUES ('e3049c23-19c1-4cca-b999-ef25c4d09c5a', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'account_created', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 16:17:33', NULL);
INSERT INTO `securitylogs` VALUES ('e4473d32-23b6-473b-9070-a56ce7cb2d98', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 23:03:16', NULL);
INSERT INTO `securitylogs` VALUES ('f6ecd29a-a0cd-49a0-ba6d-f4f22c6ae23d', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'login', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:18:38', NULL);
INSERT INTO `securitylogs` VALUES ('fb5252cd-23f6-4de4-9f6c-62fad8fccdcb', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'password_updated', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"passwordId\": \"3c051012-358d-416e-8d53-c76adcc86c9c\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-15 00:03:10', '3c051012-358d-416e-8d53-c76adcc86c9c');

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

-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `device_info` json NULL COMMENT '设备信息',
  `ip_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '登录IP',
  `user_agent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '用户代理',
  `expires_at` datetime NULL DEFAULT NULL COMMENT '过期时间',
  `is_active` tinyint(1) NULL DEFAULT 1 COMMENT '是否活跃',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sessions
-- ----------------------------
INSERT INTO `sessions` VALUES ('0edea377-8df2-4b02-b101-61bf6d634d57', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:31:09', 1, '2025-11-14 22:16:09', '2025-11-14 22:16:09');
INSERT INTO `sessions` VALUES ('107792d2-0390-41ed-b703-92356cd9b2d6', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:58:08', 1, '2025-11-14 22:57:53', '2025-11-14 22:57:53');
INSERT INTO `sessions` VALUES ('110f7b8f-1a33-4ea9-975b-0d26cf1c4176', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:14:34', 1, '2025-11-14 21:59:34', '2025-11-14 21:59:34');
INSERT INTO `sessions` VALUES ('11b819da-cb46-47e5-93ea-cd82a1decc80', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:44:44', 1, '2025-11-14 22:44:29', '2025-11-14 22:44:29');
INSERT INTO `sessions` VALUES ('3f20edb5-5a73-4917-a9a6-0e777bc8d28f', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:16:22', 1, '2025-11-14 22:01:22', '2025-11-14 22:01:22');
INSERT INTO `sessions` VALUES ('43bf7437-6eb4-470f-aacb-fa154634b843', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:29:27', 1, '2025-11-14 22:14:27', '2025-11-14 22:14:27');
INSERT INTO `sessions` VALUES ('5016015f-1ffc-4131-9d4e-680f7ea244d0', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:14:54', 1, '2025-11-14 21:59:54', '2025-11-14 21:59:54');
INSERT INTO `sessions` VALUES ('51cfe55d-b92e-407a-a400-84e5f1ed570f', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 23:00:51', 1, '2025-11-14 23:00:36', '2025-11-14 23:00:36');
INSERT INTO `sessions` VALUES ('575576fd-3b5b-4315-bd0d-7161992a9b08', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:52:43', 1, '2025-11-14 22:52:29', '2025-11-14 22:52:29');
INSERT INTO `sessions` VALUES ('6188b929-dd1c-4c95-93ab-fe9f8631b74b', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:16:08', 1, '2025-11-14 22:01:08', '2025-11-14 22:01:08');
INSERT INTO `sessions` VALUES ('74332162-50bf-447a-a621-f5701c8aa3a1', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 23:01:51', 1, '2025-11-14 23:01:36', '2025-11-14 23:01:36');
INSERT INTO `sessions` VALUES ('7552b06c-2513-46b9-a03b-07de362de3bc', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:12:32', 1, '2025-11-14 21:57:33', '2025-11-14 21:57:33');
INSERT INTO `sessions` VALUES ('781e175a-1b29-4edb-9f75-3e4c872f92ad', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', '{\"os\": \"undefined undefined\", \"type\": \"Desktop\", \"browser\": \"Unknown Browser\", \"osVersion\": \"\", \"browserVersion\": \"\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-15 00:14:42', 1, '2025-11-14 23:59:42', '2025-11-14 23:59:42');
INSERT INTO `sessions` VALUES ('7cd9eade-0ee9-46e9-844b-9850946b35a6', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:33:38', 1, '2025-11-14 22:18:38', '2025-11-14 22:18:38');
INSERT INTO `sessions` VALUES ('81391e42-ee42-4d56-8776-65d2a8f2d2f6', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:24:32', 1, '2025-11-14 22:24:17', '2025-11-14 22:24:17');
INSERT INTO `sessions` VALUES ('85f5b1ff-b4d5-42bf-91c7-351155391b86', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:25:29', 1, '2025-11-14 22:25:14', '2025-11-14 22:25:14');
INSERT INTO `sessions` VALUES ('949d9613-8455-4fa6-a03b-7d63596c59c6', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', '{\"os\": \"undefined undefined\", \"type\": \"Desktop\", \"browser\": \"Unknown Browser\", \"osVersion\": \"\", \"browserVersion\": \"\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-15 00:37:41', 1, '2025-11-15 00:22:41', '2025-11-15 00:22:41');
INSERT INTO `sessions` VALUES ('a1c19fcd-71e7-4c5c-bf0f-c846f82fce30', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:16:32', 1, '2025-11-14 22:01:32', '2025-11-14 22:01:32');
INSERT INTO `sessions` VALUES ('bcaedfbd-4fba-47c2-b509-3c696ebc710f', 'fc50fe37-37d9-4967-b06c-d48d1b8061b2', '{\"os\": \"undefined undefined\", \"type\": \"Desktop\", \"browser\": \"Unknown Browser\", \"osVersion\": \"\", \"browserVersion\": \"\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-14 23:56:59', 1, '2025-11-14 23:41:59', '2025-11-14 23:41:59');
INSERT INTO `sessions` VALUES ('c3e003e9-00a4-4d9c-bd53-7f1e10621845', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:06:36', 1, '2025-11-14 21:51:36', '2025-11-14 21:51:36');
INSERT INTO `sessions` VALUES ('c8159aba-1fa6-444b-815f-f03e51c683c5', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 23:08:53', 1, '2025-11-14 23:08:38', '2025-11-14 23:08:38');
INSERT INTO `sessions` VALUES ('c98943e9-fb42-4294-98ba-030f44bd77b2', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:16:01', 1, '2025-11-14 22:01:01', '2025-11-14 22:01:01');
INSERT INTO `sessions` VALUES ('d33370de-4083-4d66-a81f-b21304e8d2da', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 23:11:45', 1, '2025-11-14 23:11:30', '2025-11-14 23:11:30');
INSERT INTO `sessions` VALUES ('d753950c-596a-4bd3-b474-59671fb237c1', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:32:27', 1, '2025-11-14 22:17:28', '2025-11-14 22:17:28');
INSERT INTO `sessions` VALUES ('da962c29-bf3f-4ea5-8727-d9ee80e5537e', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:42:16', 1, '2025-11-14 22:42:01', '2025-11-14 22:42:01');
INSERT INTO `sessions` VALUES ('db0a72f1-57ba-4cee-974e-13133cca11b6', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:08:39', 1, '2025-11-14 21:53:39', '2025-11-14 21:53:39');
INSERT INTO `sessions` VALUES ('e47a24d0-80cf-4a70-afb0-79553f27d895', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 23:03:31', 1, '2025-11-14 23:03:16', '2025-11-14 23:03:16');
INSERT INTO `sessions` VALUES ('f95e02a6-47e0-4598-ae17-fb28b0e85435', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:21:14', 1, '2025-11-14 22:20:59', '2025-11-14 22:20:59');
INSERT INTO `sessions` VALUES ('fc62e6a3-407f-4b2b-82a9-31620e8f903a', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:40:05', 1, '2025-11-14 22:39:50', '2025-11-14 22:39:50');
INSERT INTO `sessions` VALUES ('fd0c83b4-2b83-48cb-ba04-d87ba035269c', '4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', '{\"os\": \"Windows 10\", \"type\": \"Desktop App\", \"browser\": \"Electron\", \"osVersion\": \"10\", \"browserVersion\": \"38.4.0\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-14 22:15:25', 1, '2025-11-14 22:00:25', '2025-11-14 22:00:25');

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
INSERT INTO `users` VALUES ('4f49e5a4-c056-4d6d-87b8-2d3b7e62d658', 'yuhuo666', '1872848105@qq.com', '$2b$10$IZtSYby.RzkMN2ievWRI2eOp0h2gx/ienDoLuMahql0zm9jw0VMOS', 1, '$2b$10$9amQjUKFzDzd7HNQnaNgc.WcnBMzryVbiw9Nl3Km5wbI/6rVOsfcu', 'user', 1, '2025-11-14 23:11:30', 0, NULL, NULL, 0, NULL, '2025-11-14 16:17:33', '2025-11-14 23:43:26');
INSERT INTO `users` VALUES ('fc50fe37-37d9-4967-b06c-d48d1b8061b2', 'admin', 'admin@yuhuo.com', '$2b$10$pjNynA9ynBInPxW5wVdzje2.8oPu4khlWdea30pFI2Pu2uRx9CrqW', 1, '$2b$10$1GOeus3HXt.xj3jopl.nZuzOI7Do8hymm2.HKpRGJxI4Z398BgAMK', 'admin', 1, '2025-11-15 00:22:41', 0, NULL, NULL, 0, NULL, '2025-11-14 15:57:22', '2025-11-15 00:22:41');

SET FOREIGN_KEY_CHECKS = 1;
