const crypto = require('crypto');

// 使用 AES-256-GCM 算法。这是一种现代、安全的对称加密算法，同时提供加密和认证。
// '256' 指的是密钥长度，'GCM' (Galois/Counter Mode) 提供了对数据完整性的验证。
const ALGORITHM = 'aes-256-gcm';

// PBKDF2 的迭代次数。PBKDF2 是一个密钥派生函数，通过多次哈希来“拉伸”密钥，
// 使暴力破解攻击变得极其昂贵和耗时。100,000 是目前推荐的安全值。
const PBKDF2_ITERATIONS = 100000;

// 派生密钥的长度，单位是字节。
// 32 字节 = 256 位，这与 'aes-256-gcm' 算法所需的密钥长度相匹配。
const KEY_LENGTH = 32;

// 初始化向量 (IV) 的长度，单位是字节。
// IV 确保即使使用相同的密钥和明文，每次加密的结果都不同，防止模式分析攻击。
// 对于 AES-GCM，推荐的 IV 长度是 12 字节 (96位)，但 16 字节 (128位) 也是常见且安全的。
const IV_LENGTH = 16;

// 盐值 的长度，单位是字节。
// 盐值是随机数据，用于防止对派生密钥的预计算和彩虹表攻击。
// 16 字节 (128位) 是一个标准且安全的长度。
const SALT_LENGTH = 16;

class Encryption {
    /**
     * 使用 masterPassword 加密数据
     * @param {string} text - 要加密的明文
     * @param {string} masterPassword - 用户的主密码
     * @returns {string} - 返回一个包含所有必要信息的Base64编码字符串，用于存储
     */
    static encrypt(text, masterPassword) {
        try {
            // 1. 为每次加密操作生成一个唯一的、随机的盐值
            const salt = crypto.randomBytes(SALT_LENGTH);

            // 2. 使用主密码和盐值，通过 PBKDF2 算法派生出一个安全的加密密钥
            // 这个过程是确定性的：相同的 masterPassword 和 salt 总是生成相同的 key
            const key = crypto.pbkdf2Sync(masterPassword, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');

            // 3. 为本次加密操作生成一个唯一的、随机的初始化向量 (IV)
            const iv = crypto.randomBytes(IV_LENGTH);

            // 4. 使用密钥和 IV 创建一个 AES-256-GCM 加密器
            const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

            // 5. 更新加密器，处理明文数据。'utf8' -> 'hex' 表示输入是UTF8字符串，输出是十六进制。
            let encrypted = cipher.update(text, 'utf8', 'hex');
            // 6. 完成加密过程，处理剩余的数据块（如果有的话）
            encrypted += cipher.final('hex');

            // 7. 获取 GCM 认证标签。这个标签是解密时验证数据完整性的关键。
            const authTag = cipher.getAuthTag();

            // 8. 将所有加密组件（盐值、IV、认证标签、加密数据）组合成一个对象
            const payload = {
                salt: salt.toString('hex'), // 将 Buffer 转换为十六进制字符串以便序列化
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex'),
                encryptedData: encrypted
            };

            // 9. 将 payload 对象转换为 JSON 字符串，然后编码为 Base64，以便安全地存储在数据库或文件中
            return Buffer.from(JSON.stringify(payload)).toString('base64');
        } catch (error) {
            console.error("Encryption failed:", error);
            throw new Error('Encryption process failed.');
        }
    }

    /**
     * 使用 masterPassword 解密数据
     * @param {string} encryptedPayloadBase64 - encrypt方法生成的Base64字符串
     * @param {string} masterPassword - 用户的主密码
     * @returns {string} - 返回解密后的明文
     */
    static decrypt(encryptedPayloadBase64, masterPassword) {
        try {
            // 1. 将 Base64 字符串解码回原始的 JSON 字符串
            const payload = JSON.parse(Buffer.from(encryptedPayloadBase64, 'base64').toString('utf8'));
            // 2. 从 payload 对象中解构出所有必要的组件
            const { salt, iv, authTag, encryptedData } = payload;

            // 3. 使用存储的盐值和用户提供的主密码，重新派生出完全相同的加密密钥
            const key = crypto.pbkdf2Sync(masterPassword, Buffer.from(salt, 'hex'), PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');

            // 4. 使用密钥和 IV 创建一个 AES-256-GCM 解密器
            const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));

            // 5. 【关键】设置认证标签。如果密文在存储或传输过程中被篡改，此步骤将抛出错误。
            decipher.setAuthTag(Buffer.from(authTag, 'hex'));

            // 6. 解密数据。'hex' -> 'utf8' 表示输入是十六进制，输出是UTF8字符串。
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            // 7. 完成解密过程
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error("Decryption failed:", error);
            // 解密失败通常意味着：主密码错误、数据被篡改或 payload 格式损坏
            throw new Error('Decryption failed. Incorrect master password or corrupted data.');
        }
    }

    /**
     * 生成一个可配置的随机密码
     * @param {number} length - 密码长度，默认为12
     * @param {object} options - 配置选项
     * @returns {string} - 生成的随机密码
     */
    static generateRandomPassword(length = 12, options = {}) {
        // 解构配置选项，并设置默认值
        const {
            includeUppercase = true,
            includeLowercase = true,
            includeNumbers = true,
            includeSymbols = true,
            excludeSimilar = true, // 排除相似字符 (如 '0' 和 'O', 'l' 和 '1')
            excludeAmbiguous = true, // 排除易混淆字符 (如 '{', '}', '[', ']', '(', ')', '/', '\', '"', '`', '~', ',', ';', '.', '<', '>')
        } = options;

        let charset = '';

        // 根据选项构建最终的字符集
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

        // 使用 Node.js 的 crypto 模块生成加密安全的随机数
        const randomValues = new Uint32Array(length);
        crypto.getRandomValues(randomValues);

        // 将随机值映射到字符集中的字符，构建密码
        for (let i = 0; i < length; i++) {
            // 使用取模运算确保索引在字符集长度范围内
            password += charset[randomValues[i] % charset.length];
        }

        return password;
    }

    /**
     * 生成一个超强密码
     * @param {number} length - 密码长度，默认为64
     * @returns {string} - 生成的超强密码
     */
    static generateSuperStrongPassword(length = 64) {
        // 定义一个包含所有可能字符类型的最大字符集
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';

        // 生成指定长度的加密安全的随机字节
        const bytes = crypto.randomBytes(length);
        let password = '';

        // 将每个随机字节映射到字符集中的一个字符
        for (let i = 0; i < bytes.length; i++) {
            password += charset[bytes[i] % charset.length];
        }

        return password;
    }
}

module.exports = Encryption;