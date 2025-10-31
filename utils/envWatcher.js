// utils/envWatcher.js
const chokidar = require('chokidar');
const crypto = require('crypto');
const fs = require('fs');

// 支持传入自定义配置（如监听文件列表）
function watchEnvFiles(options = {}) {
    // 配置默认值：监听 .env 和 .env.*（排除 .env.keys）
    const { watchFiles = getDefaultEnvFiles() } = options;

    // 存储文件哈希值（用于比对修改）
    const fileHashes = new Map();

    // 初始化：计算当前文件哈希
    watchFiles.forEach(file => {
        fileHashes.set(file, getFileHash(file));
    });

    // 创建监听器
    const watcher = chokidar.watch(watchFiles, {
        persistent: true,
        ignoreInitial: true,
    });

    // 监听文件变化
    watcher
        .on('change', handleFileChange)
        .on('add', handleFileAdd)
        .on('unlink', handleFileDelete);

    // 处理文件变化
    async function handleFileChange(file) {
        const oldHash = fileHashes.get(file);
        const newHash = getFileHash(file);
        if (oldHash && newHash && oldHash !== newHash) {
            await promptEncrypt(file);
            fileHashes.set(file, newHash);
        }
    }

    // 处理新增文件
    async function handleFileAdd(file) {
        const newHash = getFileHash(file);
        fileHashes.set(file, newHash);
        await promptEncrypt(file);
    }

    // 处理文件删除
    function handleFileDelete(file) {
        fileHashes.delete(file);
    }

    // 计算文件哈希（MD5）
    function getFileHash(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return crypto.createHash('md5').update(content).digest('hex');
        } catch (err) {
            return null;
        }
    }

    // 获取默认监听的环境文件（.env 和 .env.*，排除 .env.keys）
    function getDefaultEnvFiles() {
        return fs.readdirSync('.')
            .filter(file =>
                (file === '.env' || file.startsWith('.env.')) &&
                !file.endsWith('.keys')
            );
    }

    // 提示加密
    async function promptEncrypt(file) {
        console.log(`\n⚠️  检测到环境文件 ${file} 已修改`);
        try {
            // 导入 inquirer 并执行提示操作
            const { default: inquirer } = await import('inquirer');
            const answers = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'encrypt',
                    message: '是否立即执行加密操作？(y/n)',
                    default: true,
                }
            ]);
            if (answers.encrypt) {
                try {
                    // 使用绝对路径调用 dotenvx
                    const path = require('path');
                    const { spawn } = require('child_process');
                    
                    // 构建完整的 dotenvx 路径
                    const dotenvxPath = path.join(__dirname, '../node_modules/@dotenvx/dotenvx/src/cli/dotenvx.js');
                    
                    // 使用 node 直接执行脚本
                    const child = spawn('node', [dotenvxPath, 'encrypt'], {
                        stdio: 'inherit',
                        timeout: 10000, // 10秒超时
                        shell: true // 在 Windows 上需要 shell
                    });
                    
                    child.on('close', (code) => {
                        if (code === 0) {
                            console.log(`✅ ${file} 加密完成`);
                        } else {
                            console.error(`❌ 加密失败，退出码: ${code}`);
                        }
                    });
                    
                    child.on('error', (err) => {
                        console.error(`❌ 加密进程错误: ${err.message}`);
                    });
                } catch (err) {
                    console.error(`❌ 加密失败：${err.message}`);
                }
            } else {
                console.log('ℹ️  已取消加密，请注意安全风险');
            }
        } catch (err) {
            console.error(`❌ 提示失败：${err.message}`);
        }
    }

    // 返回监听器实例（可选，方便外部关闭）
    return watcher;
}

// 按需导出模块
module.exports = { watchEnvFiles };