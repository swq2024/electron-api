const { join } = require('path');
const fs = require('fs');

function loadEnv() {
    const env = process.env.NODE_ENV || 'development';
    const basePath = process.cwd();

    // 变量相同的情况下, 加载优先级: .env.local > .env.development > .env
    const envFiles = [
        join(basePath, '.env'),
        join(basePath, `.env.${env}`),
        join(basePath, '.env.local')
    ]

    // 反向遍历, 靠后的文件优先级更高
    for (let i = envFiles.length - 1; i >= 0; i--) {
        const file = envFiles[i];
        if (fs.existsSync(file)) {
            // 加载
            require('@dotenvx/dotenvx').config({
                path: file,
                // 加载私钥文件
                envKeysFile: join(basePath, '.env.keys'),
                logLevel: process.env.LOG_LEVEL
            });
        }
    }
}

// 默认导出函数, 方便外部调用 require("./utils/loadEnv")()
module.exports = loadEnv;