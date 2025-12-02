const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

/**
 * 生成访问令牌 AT 和刷新令牌 RT 令牌对
 * @param {*} user 用户对象
 * @returns { accessToken, refreshToken } 返回访问令牌 AT 和刷新令牌 RT 的字符串。
 */
const generateTokenPair = (user) => {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    token_version: user.tokenVersion, // 用户令牌版本号，用于会话管理
    jti: uuidv4(), // 令牌唯一标识符，用于会话管理
  };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30m",
  });
  const refreshToken = uuidv4();

  return { accessToken, refreshToken };
};

/**
 * 验证访问令牌 AT
 * @param {*} token 令牌字符串
 * @returns 解码后的载荷信息或null（如果验证失败）
 */
const verifyToken = (token) => {
  try {
    // 返回解码后的令牌信息，但不包括签名部分。如果验证失败，将抛出错误。
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * 解码令牌，返回完整的令牌信息（包括签名部分）
 * @param {*} token 令牌字符串
 * @returns 解码后的载荷信息或null（如果验证失败）
 */
const decodeToken = (token) => {
  try {
    // 返回解码后的令牌信息，包括签名部分。complete 默认false，不返回签名部分。如果验证失败，将抛出错误。
    return jwt.decode(token, { complete: true });
  } catch (error) {
    return null;
  }
};

module.exports = {
  verifyToken,
  generateTokenPair,
  decodeToken,
};
