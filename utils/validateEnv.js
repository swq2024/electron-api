// 应用启动时验证环境变量是否缺失，并确保它们符合预期格式。
function validateEnvironment() {
  try {
    const requiredVars = ['DB_HOST', 'API_KEY', 'NODE_ENV'];
    const missingVars = requiredVars.filter(key => !process.env[key]);

    // 检查是否缺少任何必需的环境变量
    if (missingVars.length > 0) {
      throw new Error(`缺少必需的环境变量: ${missingVars.join(', ')}`);
    }

    // 验证特定格式
    if (process.env.NODE_ENV && !['local', 'development', 'production', 'staging', 'test'].includes(process.env.NODE_ENV)) {
      throw new Error('NODE_ENV 必须是 local, development, production, staging 或 test 之一。');
    }
  } catch (error) {
    console.error('环境变量验证失败:', error.message);
    process.exit(1); // 非零退出码表示有错误发生
  }
}

module.exports = validateEnvironment;
