const crypto = require('crypto');

const algoritmo = 'aes-256-cbc';
const keyLength = 32; // 256 bits
const ivLength = 16; // 128 bits

/**
 * 加密文本
 * @param {string} text 要加密的文本
 * @param {string} salt 盐值，用于密钥派生
 * @returns {object} 包含加密文本和初始化向量(IV)的对象
 */
function encrypt(text, salt) {
    try {
        // 使用PBKDF2从盐值派生密钥
        const key = crypto.pbkdf2Sync(salt, salt, 100000, keyLength, 'sha256');

        // 生成随机初始化向量（IV）
        const iv = crypto.randomBytes(ivLength);

        // 创建加密器
        const cipher = crypto.createCipheriv(algoritmo, key, iv);

        // 加密文本 (使用utf8编码，并以十六进制格式输出)
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // 返回IV和加密文本的组合
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Error encrypting text:', error);
        throw new Error('Encryption failed');
    }
}

/**
 * 解密文本
 * @param {string} encryptedText 加密后的文本
 * @param {string} salt 盐值，用于密钥派生
 * @returns {string} 解密后的文本
 */
function decrypt(encryptedText, salt) {
    try {
        // 使用PBKDF2从盐值派生密钥
        const key = crypto.pbkdf2Sync(salt, salt, 100000, keyLength, 'sha256');

        // 从加密文本中提取IV和实际加密内容
        const textParts = encryptedText.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encrypted = textParts.join(':');

        // 创建解密器
        const decipher = crypto.createDecipheriv(algoritmo, key, iv);

        // 解密文本 (使用utf8编码，并以十六进制格式输出)
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Error decrypting text:', error);
        throw new Error('Decryption failed');
    }
}

/**
 * 生成随机密码
 */
function generateRandomPassword(length = 12, options = {}) {
    // 生成随机密码的逻辑...
    const {
        includeUppercase = true,
        includeLowercase = true,
        includeNumbers = true,
        includeSymbols = true,
        excludeSimilar = true,
        excludeAmbiguous = true,
    } = options;

    let charset = '';

    // 根据选项构建字符集
    if (includeLowercase) {
        charset += excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    }
    if (includeUppercase) {
        charset += excludeSimilar ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    if (includeNumbers) {
        charset += excludeSimilar ? '23456789' : '0123456789';
    }
    if (includeSymbols) {
        charset += excludeAmbiguous ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '!@#$%^&*()_+-=[]{}|;:,.<>?`~\'"';
    }
    if (!charset) {
        throw new Error('At least one character set must be included');
    }

    let password = '';

    const randomValues = new Uint32Array(length); // 创建一个足够大的Uint32Array来存储随机数
    crypto.getRandomValues(randomValues); // 填充randomValues数组

    for (let i = 0; i < length; i++) {
        const index = randomValues[i] % charset.length; // 取模以确保索引在字符集长度范围内
        password += charset[index];
    }

    return password;
}

module.exports = {
    encrypt,
    decrypt,
    generateRandomPassword
};
