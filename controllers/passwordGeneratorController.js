const { generateRandomPassword } = require('../services/encryptionService');
const { calculatePasswordStrength } = require('../services/passwordService')
const { createSuccessResponse, createFailResponse } = require('../utils/response');

const passwordGeneratorController = {
    // 生成随机密码
    async generate(req, res) {
        try {
            const {
                length = 12,
                includeUppercase = true,
                includeLowercase = true,
                includeNumbers = true,
                includeSymbols = true,
                excludeSimilar = true,
                excludeAmbiguous = true
            } = req.body;

            if (length < 4 || length > 128) {
                return createFailResponse(res, 400, 'Password length must be between 4 and 128 characters');
            }
            if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
                return createFailResponse(res, 400, 'At least one character type must be included');
            }

            const password = generateRandomPassword(length, {
                includeUppercase,
                includeLowercase,
                includeNumbers,
                includeSymbols,
                excludeSimilar,
                excludeAmbiguous
            });

            // 计算密码强度评分
            const passwordStrength = calculatePasswordStrength(password);
            return createSuccessResponse(res, 200, 'Password generated successfully', {
                password,
                strength: passwordStrength
            });

        } catch (error) {
            console.error('Error generating random password:', error);
            return createFailResponse(res, 'Failed to generate password');
        }
    }
}

module.exports = passwordGeneratorController;