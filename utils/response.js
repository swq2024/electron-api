/**
 * 创建成功响应
 * @param {Object} res 响应对象
 * @param {number} statusCode 状态码
 * @param {string} message 响应消息
 * @param {Object} data 响应数据
 * @returns {object} 返回响应结果
 */
function createSuccessResponse(res, statusCode, message, data = null) {
    const response = {
        success: true,
        message,
        data
    }
    res.status(statusCode).json(response);
}

/**
 * 创建失败响应
 * @param {*} res 响应对象
 * @param {*} statusCode 状态码 
 * @param {*} message 响应消息 
 * @param {*} error 错误信息
 */
function createFailResponse(res, statusCode, message, errors = null) {
    const response = {
        success: false,
        message,
        errors
    }
    res.status(statusCode).json(response);
}

module.exports = {
    createSuccessResponse,
    createFailResponse
}