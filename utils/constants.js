const crypto = require('crypto');

function generateRandomString(length = 32, encoding = 'hex') {
    return crypto.randomBytes(length).toString(encoding);
}

module.exports = {
    generateRandomString,
    // 其他函数...
};