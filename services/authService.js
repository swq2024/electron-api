const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const generateToken = (userId, role) => {
    const payload = {
        userId,
        role,
        /**
         * 添加唯一标识符，用于黑名单管理 JTI（JWT ID）是一个可选的声明，用于标识每个令牌的唯一性。
         * 在黑名单管理中，我们可以使用这个ID来识别并阻止特定的令牌被再次接受验证。
         */
        jti: uuidv4()
    }

    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d', }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken,
};