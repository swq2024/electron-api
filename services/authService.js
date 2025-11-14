const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// 生成token对: 用户登录成功后，生成一对token对（accessToken和refreshToken）并返回给客户端。
const generateTokenPair = (user) => {
    const payload = {
        userId: user.id,
        token_version: user.tokenVersion
    }
    const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '15m', }
    )
    const refreshToken = uuidv4();

return { accessToken, refreshToken };
};

const verifyToken = (token) => {
    try {
        // 返回解码后的令牌信息，但不包括签名部分。如果验证失败，将抛出错误。
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    verifyToken,
    generateTokenPair,
};