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

 Date: 23/11/2025 22:48:30
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
INSERT INTO `categories` VALUES ('83540a2e-dfe4-4157-9423-226eb48d7193', '09ce60b0-0ab8-4550-9dd5-b13b8333fd88', 'General', '#95a5a6', 'folder', 1, '2025-11-23 22:41:58', '2025-11-23 22:41:58');
INSERT INTO `categories` VALUES ('a06a19b2-ffef-44d4-9eed-730cbdec53a7', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', '游戏平台', '#3498db', 'folder', 0, '2025-11-17 18:42:46', '2025-11-17 23:26:54');
INSERT INTO `categories` VALUES ('b5909371-e270-46a3-86dc-1179415a38aa', 'f54ec851-b493-45da-a3a5-5bd9f64d115b', 'General', '#95a5a6', 'folder', 1, '2025-11-23 22:10:40', '2025-11-23 22:10:40');
INSERT INTO `categories` VALUES ('fabb1853-fe14-4c1a-a6f5-a9afe6b86f1e', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'General', '#95a5a6', 'folder', 1, '2025-11-16 01:45:45', '2025-11-17 23:26:54');

-- ----------------------------
-- Table structure for likes
-- ----------------------------
DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `password_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `likes_password_id`(`password_id` ASC) USING BTREE,
  INDEX `likes_user_id`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of likes
-- ----------------------------
INSERT INTO `likes` VALUES ('01884fe0-4b4f-4a4a-b402-42e665ce7a9d', '1374f9ab-9810-48ba-a94b-65003f0fe805', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', '2025-11-23 20:21:58', '2025-11-23 20:21:58');
INSERT INTO `likes` VALUES ('2d494056-ecdc-450f-abd6-a93a003137a9', 'a4848ccc-e866-41d7-abc9-009758e7812f', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', '2025-11-23 20:21:44', '2025-11-23 20:21:44');

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
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of logs
-- ----------------------------
INSERT INTO `logs` VALUES (1, 'error', '服务器未知错误: log is not defined', '{\"service\":\"keyVault-log-service\",\"stack\":\"ReferenceError: log is not defined\\n    at changePassword (F:\\\\electron\\\\backend-service\\\\controllers\\\\userController.js:130:13)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\"}', '2025-11-17 18:35:39');
INSERT INTO `logs` VALUES (2, 'error', '服务器未知错误: Assignment to constant variable.', '{\"service\":\"keyVault-log-service\",\"stack\":\"TypeError: Assignment to constant variable.\\n    at generate (F:\\\\electron\\\\backend-service\\\\controllers\\\\passwordGeneratorController.js:47:26)\\n    at Layer.handle [as handle_request] (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\layer.js:95:5)\\n    at next (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\route.js:137:13)\\n    at Route.dispatch (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\route.js:112:3)\\n    at Layer.handle [as handle_request] (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\layer.js:95:5)\\n    at F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\index.js:281:22\\n    at Function.process_params (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\index.js:335:12)\\n    at next (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\index.js:275:10)\\n    at authenticate (F:\\\\electron\\\\backend-service\\\\middlewares\\\\auth.js:95:9)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\"}', '2025-11-17 23:14:57');
INSERT INTO `logs` VALUES (3, 'error', '服务器未知错误: Password not found', '{\"service\":\"keyVault-log-service\",\"stack\":\"Error: Password not found\\n    at F:\\\\electron\\\\backend-service\\\\routes\\\\likes.js:18:27\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\"}', '2025-11-23 16:56:24');
INSERT INTO `logs` VALUES (4, 'error', '服务器未知错误: Password not found', '{\"service\":\"keyVault-log-service\",\"stack\":\"Error: Password not found\\n    at collectPassword (F:\\\\electron\\\\backend-service\\\\controllers\\\\passwordController.js:694:29)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\"}', '2025-11-23 17:03:33');
INSERT INTO `logs` VALUES (5, 'error', '服务器未知错误: Invalid input', '{\"service\":\"keyVault-log-service\",\"stack\":\"Error: Invalid input\\n    at collectPassword (F:\\\\electron\\\\backend-service\\\\controllers\\\\passwordController.js:692:29)\\n    at Layer.handle [as handle_request] (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\layer.js:95:5)\\n    at next (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\route.js:137:13)\\n    at middleware (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express-validator\\\\lib\\\\middlewares\\\\check.js:16:13)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\"}', '2025-11-23 17:05:58');
INSERT INTO `logs` VALUES (6, 'error', '服务器未知错误: password not found', '{\"service\":\"keyVault-log-service\",\"stack\":\"Error: password not found\\n    at collectPassword (F:\\\\electron\\\\backend-service\\\\controllers\\\\passwordController.js:703:29)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\"}', '2025-11-23 17:08:58');
INSERT INTO `logs` VALUES (7, 'error', '服务器未知错误: Field \'id\' doesn\'t have a default value', '{\"service\":\"keyVault-log-service\",\"name\":\"SequelizeDatabaseError\",\"parent\":{\"code\":\"ER_NO_DEFAULT_FOR_FIELD\",\"errno\":1364,\"sqlState\":\"HY000\",\"sqlMessage\":\"Field \'id\' doesn\'t have a default value\",\"sql\":\"INSERT INTO `Likes` (`id`,`passwordId`,`userId`,`createdAt`,`updatedAt`) VALUES (DEFAULT,?,?,?,?);\",\"parameters\":[\"a4848ccc-e866-41d7-abc9-009758e7812f\",\"7f9e2932-a0d5-4df8-aaaa-166ad9b66600\",\"2025-11-23 17:09:09\",\"2025-11-23 17:09:09\"]},\"original\":{\"code\":\"ER_NO_DEFAULT_FOR_FIELD\",\"errno\":1364,\"sqlState\":\"HY000\",\"sqlMessage\":\"Field \'id\' doesn\'t have a default value\",\"sql\":\"INSERT INTO `Likes` (`id`,`passwordId`,`userId`,`createdAt`,`updatedAt`) VALUES (DEFAULT,?,?,?,?);\",\"parameters\":[\"a4848ccc-e866-41d7-abc9-009758e7812f\",\"7f9e2932-a0d5-4df8-aaaa-166ad9b66600\",\"2025-11-23 17:09:09\",\"2025-11-23 17:09:09\"]},\"sql\":\"INSERT INTO `Likes` (`id`,`passwordId`,`userId`,`createdAt`,`updatedAt`) VALUES (DEFAULT,?,?,?,?);\",\"parameters\":[\"a4848ccc-e866-41d7-abc9-009758e7812f\",\"7f9e2932-a0d5-4df8-aaaa-166ad9b66600\",\"2025-11-23 17:09:09\",\"2025-11-23 17:09:09\"],\"stack\":\"Error\\n    at Query.run (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\dialects\\\\mysql\\\\query.js:52:25)\\n    at F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\sequelize.js:315:28\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async MySQLQueryInterface.insert (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\dialects\\\\abstract\\\\query-interface.js:308:21)\\n    at async Like.save (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\model.js:2490:35)\\n    at async Like.create (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\model.js:1362:12)\\n    at async collectPassword (F:\\\\electron\\\\backend-service\\\\controllers\\\\passwordController.js:710:9)\"}', '2025-11-23 17:09:10');
INSERT INTO `logs` VALUES (8, 'error', '服务器未知错误: Cannot read properties of undefined (reading \'trim\')', '{\"service\":\"keyVault-log-service\",\"stack\":\"TypeError: Cannot read properties of undefined (reading \'trim\')\\n    at sendOk (F:\\\\electron\\\\backend-service\\\\utils\\\\response.js:34:26)\\n    at collectPassword (F:\\\\electron\\\\backend-service\\\\controllers\\\\passwordController.js:714:16)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\"}', '2025-11-23 17:20:49');
INSERT INTO `logs` VALUES (9, 'error', '服务器未知错误: message.trim is not a function', '{\"service\":\"keyVault-log-service\",\"stack\":\"TypeError: message.trim is not a function\\n    at sendOk (F:\\\\electron\\\\backend-service\\\\utils\\\\response.js:28:22)\\n    at collectPassword (F:\\\\electron\\\\backend-service\\\\controllers\\\\passwordController.js:710:16)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\"}', '2025-11-23 17:21:52');
INSERT INTO `logs` VALUES (10, 'error', '服务器未知错误: Unknown column \'UserId\' in \'field list\'', '{\"service\":\"keyVault-log-service\",\"name\":\"SequelizeDatabaseError\",\"parent\":{\"code\":\"ER_BAD_FIELD_ERROR\",\"errno\":1054,\"sqlState\":\"42S22\",\"sqlMessage\":\"Unknown column \'UserId\' in \'field list\'\",\"sql\":\"SELECT `id`, `password_id` AS `passwordId`, `user_id` AS `userId`, `createdAt`, `updatedAt`, `UserId` FROM `Likes` AS `Like` WHERE `Like`.`user_id` = \'7f9e2932-a0d5-4df8-aaaa-166ad9b66600\' AND `Like`.`password_id` = \'1374f9ab-9810-48ba-a94b-65003f0fe805\' LIMIT 1;\"},\"original\":{\"code\":\"ER_BAD_FIELD_ERROR\",\"errno\":1054,\"sqlState\":\"42S22\",\"sqlMessage\":\"Unknown column \'UserId\' in \'field list\'\",\"sql\":\"SELECT `id`, `password_id` AS `passwordId`, `user_id` AS `userId`, `createdAt`, `updatedAt`, `UserId` FROM `Likes` AS `Like` WHERE `Like`.`user_id` = \'7f9e2932-a0d5-4df8-aaaa-166ad9b66600\' AND `Like`.`password_id` = \'1374f9ab-9810-48ba-a94b-65003f0fe805\' LIMIT 1;\"},\"sql\":\"SELECT `id`, `password_id` AS `passwordId`, `user_id` AS `userId`, `createdAt`, `updatedAt`, `UserId` FROM `Likes` AS `Like` WHERE `Like`.`user_id` = \'7f9e2932-a0d5-4df8-aaaa-166ad9b66600\' AND `Like`.`password_id` = \'1374f9ab-9810-48ba-a94b-65003f0fe805\' LIMIT 1;\",\"parameters\":{},\"stack\":\"Error\\n    at Query.run (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\dialects\\\\mysql\\\\query.js:52:25)\\n    at F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\sequelize.js:315:28\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async MySQLQueryInterface.select (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\dialects\\\\abstract\\\\query-interface.js:407:12)\\n    at async Like.findAll (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\model.js:1140:21)\\n    at async Like.findOne (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\model.js:1240:12)\\n    at async collectPassword (F:\\\\electron\\\\backend-service\\\\controllers\\\\passwordController.js:705:20)\"}', '2025-11-23 20:12:22');
INSERT INTO `logs` VALUES (11, 'error', '服务器未知错误: Unknown column \'UserId\' in \'field list\'', '{\"service\":\"keyVault-log-service\",\"name\":\"SequelizeDatabaseError\",\"parent\":{\"code\":\"ER_BAD_FIELD_ERROR\",\"errno\":1054,\"sqlState\":\"42S22\",\"sqlMessage\":\"Unknown column \'UserId\' in \'field list\'\",\"sql\":\"SELECT `id`, `password_id` AS `passwordId`, `user_id` AS `userId`, `createdAt`, `updatedAt`, `UserId` FROM `Likes` AS `Like` WHERE `Like`.`user_id` = \'7f9e2932-a0d5-4df8-aaaa-166ad9b66600\' AND `Like`.`password_id` = \'1374f9ab-9810-48ba-a94b-65003f0fe805\' LIMIT 1;\"},\"original\":{\"code\":\"ER_BAD_FIELD_ERROR\",\"errno\":1054,\"sqlState\":\"42S22\",\"sqlMessage\":\"Unknown column \'UserId\' in \'field list\'\",\"sql\":\"SELECT `id`, `password_id` AS `passwordId`, `user_id` AS `userId`, `createdAt`, `updatedAt`, `UserId` FROM `Likes` AS `Like` WHERE `Like`.`user_id` = \'7f9e2932-a0d5-4df8-aaaa-166ad9b66600\' AND `Like`.`password_id` = \'1374f9ab-9810-48ba-a94b-65003f0fe805\' LIMIT 1;\"},\"sql\":\"SELECT `id`, `password_id` AS `passwordId`, `user_id` AS `userId`, `createdAt`, `updatedAt`, `UserId` FROM `Likes` AS `Like` WHERE `Like`.`user_id` = \'7f9e2932-a0d5-4df8-aaaa-166ad9b66600\' AND `Like`.`password_id` = \'1374f9ab-9810-48ba-a94b-65003f0fe805\' LIMIT 1;\",\"parameters\":{},\"stack\":\"Error\\n    at Query.run (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\dialects\\\\mysql\\\\query.js:52:25)\\n    at F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\sequelize.js:315:28\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async MySQLQueryInterface.select (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\dialects\\\\abstract\\\\query-interface.js:407:12)\\n    at async Like.findAll (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\model.js:1140:21)\\n    at async Like.findOne (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\model.js:1240:12)\\n    at async collectPassword (F:\\\\electron\\\\backend-service\\\\controllers\\\\passwordController.js:705:20)\"}', '2025-11-23 20:12:53');
INSERT INTO `logs` VALUES (12, 'error', '服务器未知错误: Unknown column \'UserId\' in \'field list\'', '{\"service\":\"keyVault-log-service\",\"name\":\"SequelizeDatabaseError\",\"parent\":{\"code\":\"ER_BAD_FIELD_ERROR\",\"errno\":1054,\"sqlState\":\"42S22\",\"sqlMessage\":\"Unknown column \'UserId\' in \'field list\'\",\"sql\":\"SELECT `id`, `password_id` AS `passwordId`, `user_id` AS `userId`, `createdAt`, `updatedAt`, `UserId` FROM `Likes` AS `Like` WHERE `Like`.`user_id` = \'7f9e2932-a0d5-4df8-aaaa-166ad9b66600\' AND `Like`.`password_id` = \'a4848ccc-e866-41d7-abc9-009758e7812f\' LIMIT 1;\"},\"original\":{\"code\":\"ER_BAD_FIELD_ERROR\",\"errno\":1054,\"sqlState\":\"42S22\",\"sqlMessage\":\"Unknown column \'UserId\' in \'field list\'\",\"sql\":\"SELECT `id`, `password_id` AS `passwordId`, `user_id` AS `userId`, `createdAt`, `updatedAt`, `UserId` FROM `Likes` AS `Like` WHERE `Like`.`user_id` = \'7f9e2932-a0d5-4df8-aaaa-166ad9b66600\' AND `Like`.`password_id` = \'a4848ccc-e866-41d7-abc9-009758e7812f\' LIMIT 1;\"},\"sql\":\"SELECT `id`, `password_id` AS `passwordId`, `user_id` AS `userId`, `createdAt`, `updatedAt`, `UserId` FROM `Likes` AS `Like` WHERE `Like`.`user_id` = \'7f9e2932-a0d5-4df8-aaaa-166ad9b66600\' AND `Like`.`password_id` = \'a4848ccc-e866-41d7-abc9-009758e7812f\' LIMIT 1;\",\"parameters\":{},\"stack\":\"Error\\n    at Query.run (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\dialects\\\\mysql\\\\query.js:52:25)\\n    at F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\sequelize.js:315:28\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async MySQLQueryInterface.select (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\dialects\\\\abstract\\\\query-interface.js:407:12)\\n    at async Like.findAll (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\model.js:1140:21)\\n    at async Like.findOne (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\model.js:1240:12)\\n    at async collectPassword (F:\\\\electron\\\\backend-service\\\\controllers\\\\passwordController.js:705:20)\"}', '2025-11-23 20:14:05');
INSERT INTO `logs` VALUES (13, 'error', '服务器未知错误: password not found', '{\"service\":\"keyVault-log-service\",\"stack\":\"Error: password not found\\n    at collectPassword (F:\\\\electron\\\\backend-service\\\\controllers\\\\passwordController.js:703:29)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\"}', '2025-11-23 20:15:45');
INSERT INTO `logs` VALUES (14, 'error', '服务器未知错误: Unknown column \'UserId\' in \'field list\'', '{\"service\":\"keyVault-log-service\",\"name\":\"SequelizeDatabaseError\",\"parent\":{\"code\":\"ER_BAD_FIELD_ERROR\",\"errno\":1054,\"sqlState\":\"42S22\",\"sqlMessage\":\"Unknown column \'UserId\' in \'field list\'\",\"sql\":\"SELECT `id`, `password_id` AS `passwordId`, `user_id` AS `userId`, `createdAt`, `updatedAt`, `UserId` FROM `Likes` AS `Like` WHERE `Like`.`user_id` = \'7f9e2932-a0d5-4df8-aaaa-166ad9b66600\' AND `Like`.`password_id` = \'a4848ccc-e866-41d7-abc9-009758e7812f\' LIMIT 1;\"},\"original\":{\"code\":\"ER_BAD_FIELD_ERROR\",\"errno\":1054,\"sqlState\":\"42S22\",\"sqlMessage\":\"Unknown column \'UserId\' in \'field list\'\",\"sql\":\"SELECT `id`, `password_id` AS `passwordId`, `user_id` AS `userId`, `createdAt`, `updatedAt`, `UserId` FROM `Likes` AS `Like` WHERE `Like`.`user_id` = \'7f9e2932-a0d5-4df8-aaaa-166ad9b66600\' AND `Like`.`password_id` = \'a4848ccc-e866-41d7-abc9-009758e7812f\' LIMIT 1;\"},\"sql\":\"SELECT `id`, `password_id` AS `passwordId`, `user_id` AS `userId`, `createdAt`, `updatedAt`, `UserId` FROM `Likes` AS `Like` WHERE `Like`.`user_id` = \'7f9e2932-a0d5-4df8-aaaa-166ad9b66600\' AND `Like`.`password_id` = \'a4848ccc-e866-41d7-abc9-009758e7812f\' LIMIT 1;\",\"parameters\":{},\"stack\":\"Error\\n    at Query.run (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\dialects\\\\mysql\\\\query.js:52:25)\\n    at F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\sequelize.js:315:28\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async MySQLQueryInterface.select (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\dialects\\\\abstract\\\\query-interface.js:407:12)\\n    at async Like.findAll (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\model.js:1140:21)\\n    at async Like.findOne (F:\\\\electron\\\\backend-service\\\\node_modules\\\\sequelize\\\\lib\\\\model.js:1240:12)\\n    at async collectPassword (F:\\\\electron\\\\backend-service\\\\controllers\\\\passwordController.js:705:20)\"}', '2025-11-23 20:15:54');
INSERT INTO `logs` VALUES (15, 'warn', '只允许上传图片。仅用于演示，实际项目中请根据需求调整。', '{\"service\":\"keyVault-log-service\"}', '2025-11-23 21:37:31');
INSERT INTO `logs` VALUES (16, 'error', '服务器未知错误: \"arguments[3]\" must be of type \"string | Buffer\", got number instead.', '{\"service\":\"keyVault-log-service\",\"stack\":\"TypeError: \\\"arguments[3]\\\" must be of type \\\"string | Buffer\\\", got number instead.\\n    at encodeCommand (F:\\\\electron\\\\backend-service\\\\node_modules\\\\@redis\\\\client\\\\dist\\\\lib\\\\RESP\\\\encoder.js:17:19)\\n    at RedisCommandsQueue.commandsToWrite (F:\\\\electron\\\\backend-service\\\\node_modules\\\\@redis\\\\client\\\\dist\\\\lib\\\\client\\\\commands-queue.js:340:49)\\n    at commandsToWrite.next (<anonymous>)\\n    at RedisSocket.write (F:\\\\electron\\\\backend-service\\\\node_modules\\\\@redis\\\\client\\\\dist\\\\lib\\\\client\\\\socket.js:243:20)\\n    at #write (F:\\\\electron\\\\backend-service\\\\node_modules\\\\@redis\\\\client\\\\dist\\\\lib\\\\client\\\\index.js:713:22)\\n    at Immediate.<anonymous> (F:\\\\electron\\\\backend-service\\\\node_modules\\\\@redis\\\\client\\\\dist\\\\lib\\\\client\\\\index.js:720:24)\\n    at process.processImmediate (node:internal/timers:485:21)\"}', '2025-11-23 21:51:56');
INSERT INTO `logs` VALUES (17, 'error', '服务器未知错误: Cannot read properties of undefined (reading \'connect\')', '{\"service\":\"keyVault-log-service\",\"stack\":\"TypeError: Cannot read properties of undefined (reading \'connect\')\\n    at get (F:\\\\electron\\\\backend-service\\\\services\\\\redisService.js:72:20)\\n    at validateCaptcha (F:\\\\electron\\\\backend-service\\\\middlewares\\\\validation.js:16:27)\\n    at Layer.handle [as handle_request] (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\layer.js:95:5)\\n    at next (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\route.js:137:13)\\n    at middleware (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express-validator\\\\lib\\\\middlewares\\\\check.js:16:13)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\"}', '2025-11-23 22:01:22');
INSERT INTO `logs` VALUES (18, 'error', '服务器未知错误: Cannot read properties of undefined (reading \'client\')', '{\"service\":\"keyVault-log-service\",\"stack\":\"TypeError: Cannot read properties of undefined (reading \'client\')\\n    at get (F:\\\\electron\\\\backend-service\\\\services\\\\redisService.js:73:17)\\n    at validateCaptcha (F:\\\\electron\\\\backend-service\\\\middlewares\\\\validation.js:16:27)\\n    at Layer.handle [as handle_request] (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\layer.js:95:5)\\n    at next (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\route.js:137:13)\\n    at middleware (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express-validator\\\\lib\\\\middlewares\\\\check.js:16:13)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\"}', '2025-11-23 22:02:50');
INSERT INTO `logs` VALUES (19, 'error', '服务器未知错误: Cannot read properties of undefined (reading \'connect\')', '{\"service\":\"keyVault-log-service\",\"stack\":\"TypeError: Cannot read properties of undefined (reading \'connect\')\\n    at get (F:\\\\electron\\\\backend-service\\\\services\\\\redisService.js:72:16)\\n    at validateCaptcha (F:\\\\electron\\\\backend-service\\\\middlewares\\\\validation.js:16:27)\\n    at Layer.handle [as handle_request] (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\layer.js:95:5)\\n    at next (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express\\\\lib\\\\router\\\\route.js:137:13)\\n    at middleware (F:\\\\electron\\\\backend-service\\\\node_modules\\\\express-validator\\\\lib\\\\middlewares\\\\check.js:16:13)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\"}', '2025-11-23 22:03:25');

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
INSERT INTO `passwords` VALUES ('1374f9ab-9810-48ba-a94b-65003f0fe805', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'fabb1853-fe14-4c1a-a6f5-a9afe6b86f1e', 'GitHub 账号', NULL, 'eyJzYWx0IjoiOWFhYTk0N2QzNTc4NGFmYjM0NDRlZDcwMGI3NjhmYTYiLCJpdiI6IjljOTk5MDgyYzAyNWMwYTZjNTI1ZWYzZmNjZDRjOThkIiwiYXV0aFRhZyI6IjRhODBiYWYwMTkzYmU4YjhmNDU3NWFjMWNiZTZhYTY4IiwiZW5jcnlwdGVkRGF0YSI6ImZlNGMyODdkMmM1YyJ9', NULL, NULL, 1, NULL, '{}', 1, NULL, NULL, '2025-11-23 20:05:13', '2025-11-23 20:21:58');
INSERT INTO `passwords` VALUES ('a4848ccc-e866-41d7-abc9-009758e7812f', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'a06a19b2-ffef-44d4-9eed-730cbdec53a7', 'Steam 账号', NULL, 'eyJzYWx0IjoiMjU5YmFlZWViOTc3MzY0OTlhOThjNDYxNmJmZDczNDEiLCJpdiI6ImMxM2Q0NzZmZDZjYWU1MWVjNTkwMDgzY2RmMzM3ZWYwIiwiYXV0aFRhZyI6ImFmODQzMjM0YzBiYjc0NGE3YzVmNjNmOGQ2NGJmMjRjIiwiZW5jcnlwdGVkRGF0YSI6ImU4OGU3YTM4ZjE3NiJ9', NULL, NULL, 1, NULL, '{}', 1, NULL, NULL, '2025-11-23 17:08:42', '2025-11-23 20:21:44');

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
INSERT INTO `securitylogs` VALUES ('01a030e1-6776-4930-b1bd-8bbda0136983', 'f54ec851-b493-45da-a3a5-5bd9f64d115b', 'account_created', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-23 22:10:40', NULL);
INSERT INTO `securitylogs` VALUES ('0bdc0e32-b995-45ac-898e-abdaa8bd90b6', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-17 14:53:15', NULL);
INSERT INTO `securitylogs` VALUES ('10492c91-4b97-419d-b971-7cd1a14f3345', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'export_data', '{\"ip\": \"::1\", \"count\": 0, \"format\": \"json\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-17 18:42:35', NULL);
INSERT INTO `securitylogs` VALUES ('25aa086f-73dd-457b-ab1c-11690ae95dea', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'login', '{\"ip\": \"::1\", \"reason\": \"successful login[first login]\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-16 20:23:58', NULL);
INSERT INTO `securitylogs` VALUES ('271d13b2-1da4-499f-bdf3-bd63f8fe2e45', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'import_data', '{\"ip\": \"::1\", \"count\": 1, \"format\": \"json\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-17 18:42:46', NULL);
INSERT INTO `securitylogs` VALUES ('3853ef75-f1e5-4962-b58e-5e2f38629095', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'default_category_changed', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"newDefaultCategoryId\": \"a06a19b2-ffef-44d4-9eed-730cbdec53a7\", \"oldDefaultCategoryId\": \"fabb1853-fe14-4c1a-a6f5-a9afe6b86f1e\", \"transferredPasswordCount\": 0}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-17 23:26:17', NULL);
INSERT INTO `securitylogs` VALUES ('3a38c42a-c331-4119-8b7a-2f0dad5e9c88', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-17 13:21:20', NULL);
INSERT INTO `securitylogs` VALUES ('3c8cda2a-64aa-440e-b583-228a7a0ae0dc', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-16 22:02:31', NULL);
INSERT INTO `securitylogs` VALUES ('4b82f7d5-b5eb-4e57-a519-fa2535f68cc0', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-16 22:02:00', NULL);
INSERT INTO `securitylogs` VALUES ('5301cabb-12cb-41e1-9709-df97f72ea09a', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'password_created', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"passwordId\": \"a4848ccc-e866-41d7-abc9-009758e7812f\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-23 17:08:42', 'a4848ccc-e866-41d7-abc9-009758e7812f');
INSERT INTO `securitylogs` VALUES ('57e7083d-e39f-4a04-8368-81776036661e', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-16 22:17:27', NULL);
INSERT INTO `securitylogs` VALUES ('593d1dd0-68a1-4b54-b699-e99c0d50a478', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-17 13:21:35', NULL);
INSERT INTO `securitylogs` VALUES ('8387644b-1b74-4fab-890e-0376297a0323', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'default_category_changed', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"newDefaultCategoryId\": \"fabb1853-fe14-4c1a-a6f5-a9afe6b86f1e\", \"oldDefaultCategoryId\": \"a06a19b2-ffef-44d4-9eed-730cbdec53a7\", \"transferredPasswordCount\": 2}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-17 23:26:54', NULL);
INSERT INTO `securitylogs` VALUES ('8609dd27-4c54-4cff-a2de-449fe6df5c9b', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-16 23:22:25', NULL);
INSERT INTO `securitylogs` VALUES ('8e6e6832-48d4-4d07-8bb3-d9f0873fa3e8', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-16 22:02:15', NULL);
INSERT INTO `securitylogs` VALUES ('9b3eef36-7c50-401d-a5fd-934b3124eca1', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'password_updated', '{\"ip\": \"::1\", \"reason\": \"User changed password. Current token version: 1 -> New token version: 2\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-17 18:36:11', NULL);
INSERT INTO `securitylogs` VALUES ('9d4d9f56-0e3f-4824-92b7-42f8bf1b573c', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'password_created', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"passwordId\": \"1374f9ab-9810-48ba-a94b-65003f0fe805\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-23 20:05:13', '1374f9ab-9810-48ba-a94b-65003f0fe805');
INSERT INTO `securitylogs` VALUES ('a6e92d62-75b7-4d9f-b486-520df34ad0e3', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-16 23:07:50', NULL);
INSERT INTO `securitylogs` VALUES ('b0c37c69-f1b4-4c5c-8050-65a2a5cda1d9', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'logout', '{\"ip\": \"::1\", \"reason\": \"User requested logout\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-16 21:23:24', NULL);
INSERT INTO `securitylogs` VALUES ('ca31d7d9-04f6-4a6a-8791-c902024570c0', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-16 22:01:31', NULL);
INSERT INTO `securitylogs` VALUES ('cd4f6c80-8a91-4ec2-b810-d011c8c09820', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'user_enabled', '{\"ip\": \"::1\", \"newStatus\": \"active\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\", \"targetUserId\": \"7f9e2932-a0d5-4df8-aaaa-166ad9b66600\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-17 23:23:11', NULL);
INSERT INTO `securitylogs` VALUES ('cfc23ac6-9a52-46cd-90ea-ebea95e90177', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-17 23:48:30', NULL);
INSERT INTO `securitylogs` VALUES ('d029385f-1ba9-4127-bcf7-3f2cf32b9af0', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'export_data', '{\"ip\": \"::1\", \"count\": 1, \"format\": \"json\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-17 18:44:02', NULL);
INSERT INTO `securitylogs` VALUES ('e1df05c9-573e-4b22-b88f-af4ba48179cf', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-17 14:43:28', NULL);
INSERT INTO `securitylogs` VALUES ('e9778edf-2cac-450d-b6e2-5df31bf73d0c', '09ce60b0-0ab8-4550-9dd5-b13b8333fd88', 'account_created', '{\"ip\": \"::1\", \"userAgent\": \"Apifox/1.0.0 (https://apifox.com)\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-23 22:41:58', NULL);
INSERT INTO `securitylogs` VALUES ('eff46876-c4f3-4b65-b3e9-cfb5e46327c2', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-16 22:02:57', NULL);
INSERT INTO `securitylogs` VALUES ('f0431227-c5df-4487-b7dd-ce4e622bfd8a', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'token_refreshed', '{\"ip\": \"::1\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron-app/1.0.0 Chrome/140.0.7339.240 Electron/38.4.0 Safari/537.36', '2025-11-18 18:05:27', NULL);

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
INSERT INTO `sequelizemeta` VALUES ('20251123082220-add-avatar-to-user.js');
INSERT INTO `sequelizemeta` VALUES ('20251123083507-create-like.js');

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
INSERT INTO `sessions` VALUES ('47a24068-ca06-45fa-a0d2-0c8ceaa46566', '7f9e2932-a0d5-4df8-aaaa-166ad9b66600', '\"{\\\"at\\\":\\\"5da3db66-3554-419f-9210-ec3ea7ad743f\\\",\\\"rt\\\":\\\"d9a922df-5e5e-4786-964d-7cf7e45ded52\\\"}\"', '{\"os\": \"undefined undefined\", \"type\": \"Desktop\", \"browser\": \"Unknown Browser\", \"osVersion\": \"\", \"browserVersion\": \"\", \"deviceFingerprint\": \"undefined undefined\"}', '::1', 'Apifox/1.0.0 (https://apifox.com)', '2025-11-23 23:06:11', '2025-11-30 22:46:11', 1, '2025-11-16 20:23:58', '2025-11-23 22:46:11');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '由于该字段为UUID，所以需要设置为BINARY(16)，这样可以减少存储空间并提高索引性能',
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
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
INSERT INTO `users` VALUES ('09ce60b0-0ab8-4550-9dd5-b13b8333fd88', 'yuhuo777', '377437076@qq.com', NULL, '$2b$10$zvDFs5nPRCmNfWmXiZu7UuReIyVx60DkH7vOOJydienRGIGFAh7fO', 1, NULL, 'user', 1, NULL, 0, NULL, NULL, 0, NULL, '2025-11-23 22:41:58', '2025-11-23 22:41:58');
INSERT INTO `users` VALUES ('7f9e2932-a0d5-4df8-aaaa-166ad9b66600', 'admin123', 'admin@example.com', 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', '$2b$10$gHUT7vO.ygGjpjvQrPxRNuJF1KM.dLVpprHsLZpQ5hRMXuspYT7CO', 2, '$2b$10$BWeu4O9rHK4ym0vqg/6gUu1b2NJtqzvfXrtuh9KBA/DXeYahPu2TS', 'admin', 1, '2025-11-17 18:36:50', 0, NULL, NULL, 0, NULL, '2025-11-16 01:45:45', '2025-11-23 22:46:11');
INSERT INTO `users` VALUES ('f54ec851-b493-45da-a3a5-5bd9f64d115b', 'yuhuo666', '1872848105@qq.com', 'https://xnbjb-oss.oss-cn-wuhan-lr.aliyuncs.com/uploads/41f5b1b47f9036a20c3e2c471b352fd0.jpg', '$2b$10$QbyDkCCOvoyzjm.ZWc51S.yoDwroApayoQ1kjmZyzw3WeZRjI4Tq2', 1, NULL, 'user', 1, NULL, 0, NULL, NULL, 0, NULL, '2025-11-23 22:10:40', '2025-11-23 22:10:40');

SET FOREIGN_KEY_CHECKS = 1;
