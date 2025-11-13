const { Category, Password, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { createSuccessResponse, createFailResponse } = require('../utils/response');
const { Op } = require('sequelize');
const { logSecurityEvent } = require('../utils/logger');

const categoryController = {
    // 创建分类
    async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return createFailResponse(res, 400, 'Validation failed', errors.array());
            }

            const { name, color, icon } = req.body;
            const { id: userId } = req.user;

            // 检查分类名称是否已存在
            const existingCategory = await Category.findOne({
                where: {
                    name,
                    userId
                }
            });
            if (existingCategory) {
                return createFailResponse(res, 409, 'Category with this name already exists');
            }

            // 创建分类
            const newCategory = await Category.create({
                userId,
                name,
                color: color || '#3498db',
                icon: icon || 'folder',
            });
            return createSuccessResponse(res, 201, 'Category created successfully', {
                id: newCategory.id,
                name: newCategory.name,
                color: newCategory.color,
                icon: newCategory.icon,
                isDefault: newCategory.isDefault,
                createdAt: newCategory.createdAt,
            });
        } catch (error) {
            console.error('Create category error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 获取分类列表
    async getAll(req, res) {
        try {
            const { id: userId } = req.user;

            // 获取用户所有分类
            const categories = await Category.findAll({
                where: {
                    userId,
                },
                include: [
                    {
                        model: Password,
                        as: 'passwords',
                        attributes: ['id'],
                        required: false, // 即使没有密码，也返回分类
                    }
                ],
                order: [['name', 'ASC']]
            });

            // 添加密码数量到每个分类对象中
            const categoriesWithCount = categories.map(category => {
                const categoryData = category.toJSON();
                categoryData.passwordCount = categoryData.passwords ? categoryData.passwords.length : 0;
                delete categoryData.passwords; // 移除密码数组，只保留计数
                return categoryData;
            })

            return createSuccessResponse(res, 200, 'Categories retrieved successfully', {
                categories: categoriesWithCount
            });
        } catch (error) {
            console.error('Get all categories error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 更新分类
    async update(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return createFailResponse(res, 400, 'Validation failed', errors.array());
            }

            const { id: categoryId } = req.params;
            const { id: userId } = req.user;
            const { name, color, icon } = req.body;

            // 检查分类是否存在并属于当前用户
            const existingCategory = await Category.findOne({
                where: {
                    id: categoryId,
                    userId
                }
            })

            if (!existingCategory) {
                return createFailResponse(res, 404, 'Category not found');
            }

            // 检查分类是否是默认分类
            if (existingCategory.isDefault) {
                return createFailResponse(res, 403, 'Cannot update default category');
            }

            // 检查新名称是否与其他分类冲突
            if (name && name !== existingCategory.name) {
                const duplicateCategory = await Category.findOne({
                    where: {
                        name,
                        userId,
                        id: { [Op.ne]: categoryId } // 排除当前正在更新的分类，以避免冲突检查自身
                    }
                });
                if (duplicateCategory) {
                    return createFailResponse(res, 409, 'Category with this name already exists');
                }
            }
            // 更新分类
            await existingCategory.update({
                name: name || existingCategory.name, // 如果未提供新名称，则保留原始名称
                color: color || existingCategory.color, // 如果未提供新颜色，则保留原始颜色
                icon: icon || existingCategory.icon    // 如果未提供新图标，则保留原始图标
            });

            return createSuccessResponse(res, 200, 'Category updated successfully')
        } catch (error) {
            console.error('Update category error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 删除分类
    async delete(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return createFailResponse(res, 400, 'Validation failed', errors.array());
            }

            const { id: categoryId } = req.params;
            const { id: userId } = req.user;

            // 查找现有分类
            const existingCategory = await Category.findOne({
                where: {
                    id: categoryId,
                    userId
                }
            });

            if (!existingCategory) {
                return createFailResponse(res, 404, 'Category not found');
            }

            // 检查分类是否是默认分类
            if (existingCategory.isDefault) {
                return createFailResponse(res, 403, 'Cannot delete default category');
            }

            // 检查是否有密码使用此分类, 避免孤儿记录的存在
            const passwordsCount = await Password.count({
                where: {
                    categoryId
                }
            });

            // 代表当前分类下还有关联的密码
            if (passwordsCount > 0) {
                return createFailResponse(res, 403, 'Cannot delete category with associated passwords');
            }

            // 删除分类
            await existingCategory.destroy();

            return createSuccessResponse(res, 200, 'Category deleted successfully');
        } catch (error) {
            console.error('Delete category error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    },

    // 设置指定分类为用户的默认分类
    async setDefaulteCategory(req, res) {
        // 开启事务处理
        const transaction = await sequelize.transaction();

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return createFailResponse(res, 400, 'Validation failed', errors.array());
            }

            const { id: newDefaultCategoryId } = req.params; // 新默认分类的ID
            const { id: userId } = req.user;

            // 检查新默认分类是否存在并属于当前用户
            const categoryToSet = await Category.findOne({
                where: {
                    id: newDefaultCategoryId,
                    userId
                }
            }, { transaction });

            if (!categoryToSet) {
                await transaction.rollback();
                return createFailResponse(res, 404, 'Category not found or does not belong to you');
            }

            // 如果这个分类已经是默认的，则无需更改
            if (categoryToSet.isDefault) {
                await transaction.commit();
                return createSuccessResponse(res, 200, 'Category is already the default');
            }

            // 查找并获取旧的默认分类
            const oldDefaultCategory = await Category.findOne({
                where: {
                    userId,
                    isDefault: true
                },
            }, { transaction });

            if (oldDefaultCategory) {
                // 如果存在旧的默认分类，则将其设置为非默认状态
                await oldDefaultCategory.update({ isDefault: false }, { transaction });
            }

            let transferredCount = 0; // 用于记录转移的密码数量
            if (oldDefaultCategory) {
                const updateResult = await Password.update(
                    { categoryId: newDefaultCategoryId }, // 更新字段为新分类ID(移动到新分类)
                    {
                        where: {
                            categoryId: oldDefaultCategory.id, // 查找旧默认分类下的所有密码记录
                            userId,
                        },
                    },
                    { transaction }
                );
                transferredCount = updateResult[0]; // 获取受影响的行数，即转移的密码数量
            }

            // 将新分类设置为默认分类
            await categoryToSet.update({ isDefault: true }, { transaction });

            // 记录安全日志
            await logSecurityEvent(userId, 'default_category_changed', {
                newDefaultCategoryId,
                oldDefaultCategoryId: oldDefaultCategory ? oldDefaultCategory.id : null, // 旧的默认分类ID，如果没有则为null
                transferredPasswordCount: transferredCount, // 转移的密码数量
                ip: req.ip,
                userAgent: req.get('User-Agent')
            }, null, transaction);

            // 提交事务
            await transaction.commit();

            return createSuccessResponse(res, 200, 'Default category set successfully');
        } catch (error) {
            await transaction.rollback();
            console.error('Set default category error:', error);
            return createFailResponse(res, 500, 'Internal server error');
        }
    }
}

module.exports = categoryController;