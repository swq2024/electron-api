const { createFailResponse } = require('../utils/response');

/**
 * 全局错误处理中间件
 * @param {Error} err - 错误对象
 * @param {object} req - Express请求对象
 * @param {object} res - Express响应对象
 * @param {function} next - Express next函数
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  console.error(err);

  // Sequelize 验证错误 (例如: 字段长度不符、非空约束等)
  if (err.name === 'SequelizeValidationError') {
    const message = 'Validation Error';
    const errors = err.errors.map(val => ({
      field: val.path,
      message: val.message
    }));
    return createFailResponse(res, 400, message, errors);
  }

  // Sequelize 唯一约束错误 (例如: 用户名或邮箱已存在)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    return createFailResponse(res, 409, message); // 409 Conflict
  }

  // Sequelize 外键约束错误
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Invalid reference ID provided.';
    return createFailResponse(res, 400, message);
  }

  // JWT 错误处理
  if (err.name === 'JsonWebTokenError') {
    return createFailResponse(res, 401, 'Invalid token. Please log in again.');
  }
  // JWT 过期错误处理
  if (err.name === 'TokenExpiredError') {
    return createFailResponse(res, 401, 'Your session has expired. Please log in again.');
  }

  // 自定义应用错误 (可以创建一个AppError类来抛出特定错误)
  if (err.isOperational) {
    return createFailResponse(res, err.statusCode, err.message);
  }

  // 默认服务器内部错误
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // 在开发环境返回完整的错误堆栈，生产环境则不暴露
  const response = createFailResponse(res, statusCode, message);
  
  if (process.env.NODE_ENV === 'development') {
    response.json.error = error.stack;
  }

  return response;
};

module.exports = { errorHandler };