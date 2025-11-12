const UAParser = require('ua-parser-js');

/**
 * parse UserAgent string by ua-parser-js
 * @param {string} userAgent - Original User-Agent string
 * @returns {Object} Parsed user agent information
 */
function parseUserAgent(userAgent) {
    
    if (!userAgent) return {
        type: 'Unknown',
        os: 'Unknown',
        browser: 'Unknown',
        osVersion: '',
        browserVersion: ''
    };

    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // 特殊处理 Electron 环境
    // Electron 的 UA 通常包含 "Electron"，但 ua-parser-js 可能会将其识别为 Chrome
    const isElectron = userAgent.includes('Electron');

    return {
        type: isElectron ? 'Desktop App' : (result.device.type || 'Desktop'), // 如果没有设备类型，默认为桌面端
        os: `${result.os.name} ${result.os.version}`.trim() || 'Unknown OS', // 如果没有操作系统版本，默认为未知
        browser: isElectron ? 'Electron' : (result.browser.name || 'Unknown Browser'), // 如果没有浏览器名称，默认为未知
        osVersion: result.os.version || '', // 操作系统版本
        browserVersion: result.browser.version || '' // 浏览器版本
    }
}

module.exports = { parseUserAgent };