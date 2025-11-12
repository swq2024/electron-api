/**
 * 将各种可能的输入安全地转换为布尔值
 * @param {any} value - 输入值，通常来自请求体或查询参数
 * @returns {boolean} - 转换后的布尔值
 */
function parseBoolean(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;

  return Boolean(value);
}

module.exports = {
  parseBoolean
};