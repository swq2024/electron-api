const { Category, Password } = require('../models');
const { validationResult } = require('express-validator');
const { createSuccessResponse, createFailResponse } = require('../utils/response');
const { Op } = require('sequelize');

const categoryController = {
    // 创建分类
    async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return createFailResponse(res, errors.array()[0].msg);
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

            // 创建分类并记录安全日志
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
                return createFailResponse(res, 'Validation failed', errors.array());
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
                        id: { [Op.ne]: id } // 排除当前正在更新的分类，以避免冲突检查自身
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

            // 检查是否有密码使用此分类
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
    }
}

module.exports = categoryController;