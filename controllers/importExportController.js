const { Password, Category } = require('../models');
const { encrypt, decrypt } = require('../services/encryptionService');
const { calculatePasswordStrength } = require('../services/passwordService');
const { createSuccessResponse, createFailResponse } = require('../utils/response');
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
                passwordData.password = decrypt(passwordData.encryptedPassword, process.env.MASTER_PASSWORD);
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
                return createSuccessResponse(res, 200, 'Passwords exported successfully', {
                    passwords: decryptedPasswords
                });
            }
        } catch (error) {
            console.error('Export passwords error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 导入密码
    async import(req, res) {
        try {
            const { id: userId } = req.user;
            // 这里的passwords 应该是一个数组，每个元素都是一个对象，包含密码的详细信息。例如：
            // [
            //     { title: 'Example', password: 'examplepassword', 'category': 'Example Category' },
            //     // ... 其他密码条目
            // ]
            console.log('req.body', req.body);
            const { format = 'json' } = req.body;
            const passwords = [req.body];

            if (format === 'json' && !passwords) {
                return createFailResponse(res, 400, 'Passwords data is required for JSON import');
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
                            }
                        });

                        if (existingPassword) {
                            console.log('11111111111111111111');

                            continue; // 跳过重复条目
                        }

                        // 获取或创建分类
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
                        const encryptedPassword = encrypt(passwordData.password, process.env.MASTER_PASSWORD);

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
                                        const encryptedPassword = encrypt(passwordData.password, process.env.MASTER_PASSWORD);

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

                                resolve(createSuccessResponse(res, 200, 'Passwords imported successfully', {
                                    imported: importedPasswords.length,
                                    passwords: importedPasswords
                                }));
                            } catch (error) {
                                reject(error);
                            }
                        });
                });
            } else {
                return createFailResponse(res, 400, 'Invalid import format');
            }

            // 记录安全事件日志
            if (importedPasswords.length) {
                await logSecurityEvent(userId, 'import_data', {
                    format,
                    count: passwords ? passwords.length : 0,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                });
            }

            return createSuccessResponse(res, 200, 'Passwords imported successfully', {
                imported: importedPasswords.length,
                passwords: importedPasswords
            });
        } catch (error) {
            console.error('Import passwords error:', error);
            return createFailResponse(res, 500, 'Internal server error');
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

module.exports = importExportController