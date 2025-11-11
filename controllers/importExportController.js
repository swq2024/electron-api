const { Password, Category } = require('../models');
const { encrypt, decrypt } = require('../services/encryptionService');
const { createResponse, createErrorResponse } = require('../utils/response');
const { logSecurityEvent } = require('../utils/logger');
const csv = require('csv-parser');
const fs = require('fs');

const importExportController = {
    // 导出密码
    async export(req, res) {
        try {
            const { id: userId } = req.user;
            const { format = 'json', categoryId } = req.query;

            // 构建查询条件
            const whereClause = {
                userId,
                isDeleted: false
            };

            if (categoryId) {
                whereClause.categoryId = categoryId;
            }

            // 获取密码列表
            const passwords = await Password.findAll({
                where: whereClause,
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['name']
                    }
                ],
                order: [['title', 'ASC']]
            });

            // 解密密码
            const decryptedPasswords = passwords.map(password => {
                const passwordData = password.toJSON();
                passwordData.password = decrypt(passwordData.encryptedPassword, req.user.salt);
                delete passwordData.encryptedPassword;
                delete passwordData.userId;
                return passwordData;
            });

            // 记录安全日志
            await logSecurityEvent(userId, 'export_data', {
                format,
                count: decryptedPasswords.length,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            // 根据格式返回数据
            if (format === 'csv') {
                // 转换为CSV格式
                const csvData = convertToCSV(decryptedPasswords);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=passwords.csv');
                return res.send(csvData);
            } else {
                // 返回JSON格式
                return createResponse(res, 200, 'Passwords exported successfully', {
                    passwords: decryptedPasswords
                });
            }
        } catch (error) {
            console.error('Export passwords error:', error);
            return createErrorResponse(res, 500, 'Internal server error');
        }
    },

    // 导入密码
    async import(req, res) {
        try {
            const {
                id: userId,
                salt: userSalt
            } = req.user.id;
            const { format = 'json', passwords } = req.body;

            // 记录安全日志
            await logSecurityEvent(userId, 'import_data', {
                format,
                count: passwords ? passwords.length : 0,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            if (format === 'json' && !passwords) {
                return createErrorResponse(res, 400, 'Passwords data is required for JSON import');
            }

            let importedPasswords = [];

            if (format === 'json') {
                // 处理JSON导入
                for (const passwordData of passwords) {
                    try {
                        // 验证必要字段
                        if (!passwordData.title || !passwordData.password) {
                            continue; // 跳过无效条目
                        }

                        // 检查是否已存在相同的密码
                        const existingPassword = await Password.findOne({
                            where: {
                                userId,
                                title: passwordData.title,
                                username: passwordData.username || '',
                                isDeleted: false
                            }
                        });

                        if (existingPassword) {
                            continue; // 跳过重复条目
                        }

                        // 查找或创建分类
                        let categoryId = null;
                        if (passwordData.category) {
                            let category = await Category.findOne({
                                where: {
                                    userId,
                                    name: passwordData.category
                                }
                            });

                            if (!category) {
                                category = await Category.create({
                                    userId,
                                    name: passwordData.category,
                                    color: '#3498db',
                                    icon: 'folder'
                                });
                            }

                            categoryId = category.id;
                        }

                        // 加密密码
                        const encryptedPassword = encrypt(passwordData.password, userSalt);

                        // 计算密码强度
                        const passwordStrength = calculatePasswordStrength(passwordData.password);

                        // 创建密码记录
                        const newPassword = await Password.create({
                            userId,
                            categoryId,
                            title: passwordData.title,
                            username: passwordData.username || '',
                            encryptedPassword,
                            url: passwordData.url || '',
                            notes: passwordData.notes || '',
                            customFields: passwordData.customFields || {},
                            passwordStrength
                        });

                        importedPasswords.push({
                            id: newPassword.id,
                            title: newPassword.title
                        });
                    } catch (error) {
                        console.error('Error importing password:', error);
                        // 继续处理下一个密码
                    }
                }
            } else if (format === 'csv' && req.file) {
                // 处理CSV导入
                const results = [];

                return new Promise((resolve, reject) => {
                    fs.createReadStream(req.file.path)
                        .pipe(csv()) // 使用csv-parser解析CSV文件
                        .on('data', (data) => results.push(data))
                        .on('end', async () => {
                            try {
                                for (const passwordData of results) {
                                    try {
                                        // 验证必要字段
                                        if (!passwordData.title || !passwordData.password) {
                                            continue; // 跳过无效条目
                                        }

                                        // 检查是否已存在相同的密码
                                        const existingPassword = await Password.findOne({
                                            where: {
                                                userId,
                                                title: passwordData.title,
                                                username: passwordData.username || '',
                                                isDeleted: false
                                            }
                                        });

                                        if (existingPassword) {
                                            continue; // 跳过重复条目
                                        }

                                        // 查找或创建分类
                                        let categoryId = null;
                                        if (passwordData.category) {
                                            let category = await Category.findOne({
                                                where: {
                                                    userId,
                                                    name: passwordData.category
                                                }
                                            });

                                            if (!category) {
                                                category = await Category.create({
                                                    userId,
                                                    name: passwordData.category,
                                                    color: '#3498db',
                                                    icon: 'folder'
                                                });
                                            }

                                            categoryId = category.id;
                                        }

                                        // 加密密码
                                        const encryptedPassword = encrypt(passwordData.password, userSalt);

                                        // 计算密码强度
                                        const passwordStrength = calculatePasswordStrength(passwordData.password);

                                        // 创建密码记录
                                        const newPassword = await Password.create({
                                            userId,
                                            categoryId,
                                            title: passwordData.title,
                                            username: passwordData.username || '',
                                            encryptedPassword,
                                            url: passwordData.url || '',
                                            notes: passwordData.notes || '',
                                            passwordStrength
                                        });

                                        importedPasswords.push({
                                            id: newPassword.id,
                                            title: newPassword.title
                                        });
                                    } catch (error) {
                                        console.error('Error importing password:', error);
                                        // 继续处理下一个密码
                                    }
                                }

                                // 删除临时文件
                                fs.unlinkSync(req.file.path);

                                resolve(createResponse(res, 200, 'Passwords imported successfully', {
                                    imported: importedPasswords.length,
                                    passwords: importedPasswords
                                }));
                            } catch (error) {
                                reject(error);
                            }
                        });
                });
            } else {
                return createErrorResponse(res, 400, 'Invalid import format');
            }

            return createResponse(res, 200, 'Passwords imported successfully', {
                imported: importedPasswords.length,
                passwords: importedPasswords
            });
        } catch (error) {
            console.error('Import passwords error:', error);
            return createErrorResponse(res, 500, 'Internal server error');
        }
    }
};

// 将数据转换为CSV格式的辅助函数
function convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    const csvRows = data.map(item => {
        return headers.map(header => {
            const value = item[header];
            // 处理包含逗号或引号的值
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
}

// 计算密码强度的辅助函数
function calculatePasswordStrength(password) {
    if (!password) return 0;

    let strength = 0;

    // 长度检查
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    // 复杂性检查
    if (/[a-z]/.test(password)) strength += 1; // 小写字母
    if (/[A-Z]/.test(password)) strength += 1; // 大写字母
    if (/[0-9]/.test(password)) strength += 1; // 数字
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1; // 特殊字符

    // 返回0-5的强度值
    return Math.min(strength, 5);
}

module.exports = importExportController;