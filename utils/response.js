const multer = require("multer");
const createError = require("http-errors");
const { logger } = require("./logger");

/**
 * 成功响应
 * @param {Object} res 响应对象
 * @param {*} code 状态码
 * @param {*} code = 200, 响应消息
 * @param {*} data 响应数据
 * @param {*} nestedKey 嵌套键名（可选）
 * @returns Express 响应对象（JSON）
 */
const sendOk = (res, code = 200, message, data = {}, nestedKey = null) => {
  // 1. 处理特殊状态码 204 无内容, 不允许返回任何内容
  if (code === 204) {
    return res.status(code).send(); // 204 No Content 强制无响应体
  }

  // 2. 处理嵌套对象数据
  const responseData = nestedKey
    ? { [nestedKey]: data ?? {} } // 嵌套键存在时，包装数据（兼容 data 为 null 的情况）
    : (data ?? {}); // 无嵌套键时，直接使用数据 默认为空对象

  // 3. 设置响应体
  const response = {
    status: true,
    message: message,
    data: responseData,
  };

  // 4. 设置响应状态码和发送响应体
  return res.status(code).json(response);
};

/**
 * 失败响应
 * @param {*} res 响应对象
 * @param {*} error 错误对象
 * @returns Express 响应对象（JSON）
 */
const sendErr = (res, error) => {
  let statusCode = 500; // 默认服务器错误
  let responseMessage = "请求失败";
  let errors = ["服务器内部错误"];

  // 1. 自定义业务错误（优先处理，支持业务层抛出的特定错误）
  if (error.isOperational) {
    statusCode = error.statusCode;
    responseMessage = error.message;
    errors = Array.isArray(error.errors)
      ? error.errors
      : [error.errors || error.message];
  }

  // 2. Sequelize 数据库错误处理
  else if (error.name === "SequelizeValidationError") {
    // 数据验证错误
    statusCode = 400;
    responseMessage = "数据验证失败";
    errors = error.errors.map((val) => ({
      field: val.path,
      message: val.message,
    })); // 保留字段详情
  } else if (error.name === "SequelizeUniqueConstraintError") {
    // 唯一性约束错误
    statusCode = 409;
    const field = error.errors[0].path;
    responseMessage = `${field.charAt(0).toUpperCase() + field.slice(1)} 已存在`;
    errors = [responseMessage];
  } else if (error.name === "SequelizeForeignKeyConstraintError") {
    // 无效的关联 ID（外键约束失败）
    statusCode = 400;
    responseMessage = "无效的关联 ID（外键约束失败）";
    errors = [responseMessage];
  } else if (error.name === "SequelizeOptimisticLockError") {
    // 乐观锁冲突错误
    statusCode = 409;
    responseMessage = "请求冲突";
    errors = ["您提交的数据已被修改，请稍后重试"];
  }

  // 3. JWT 认证错误处理
  else if (error.name === "JsonWebTokenError") {
    // JWT 验证失败（例如，无效的令牌）
    statusCode = 401;
    responseMessage = "Token 无效，请重新登录";
    errors = [responseMessage];
  } else if (error.name === "TokenExpiredError") {
    // JWT 过期错误
    statusCode = 401;
    responseMessage = "会话已过期，请重新登录";
    errors = [responseMessage];
  }

  // 4. 文件上传错误处理
  else if (error instanceof multer.MulterError) {
    // 文件上传错误，例如文件大小限制或格式问题
    statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    responseMessage =
      error.code === "LIMIT_FILE_SIZE" ? "文件大小超出限制" : "文件上传失败";
    errors = [error.message];
  }

  // 5. HTTP 标准错误(由 http-errors 库创建)
  else if (error instanceof createError.HttpError) {
    // 例如，404 Not Found, 403 Forbidden 等错误
    statusCode = error.status;
    responseMessage = error.message;
    errors = [error.message];
  }

  // 6. 其他未知错误
  else {
    logger.error("服务器未知错误:", error); // 记录错误日志
    // 生产环境隐藏具体错误，开发环境暴露堆栈
    errors =
      process.env.NODE_ENV === "development"
        ? [error.message, error.stack]
        : ["服务器内部错误"];
  }

  // 构建响应体
  const response = {
    status: false, // 失败标志
    message: responseMessage, // 简洁提示
    errors: Array.isArray(errors) ? errors : [errors], // 错误详情数组
  };

  // 开发环境下，非业务错误和非 HTTP 标准错误的堆栈信息会附加到响应体中

  if (
    process.env.NODE_ENV === "development" &&
    !error.isOperational &&
    (!error) instanceof createError.HttpError
  ) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  sendOk,
  sendErr,
};
