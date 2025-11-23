module.exports = (username) => `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>注册成功 | 密钥管理系统</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <!-- 品牌标识 -->
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
        <h1 style="margin: 0; font-size: 22px; color: #202124; font-weight: 600;">密钥管理系统</h1>
        <p style="margin: 8px 0 0; color: #666; font-size: 14px;">安全、可靠的密钥/密码存储解决方案</p>
      </div>

      <!-- 核心内容：注册成功通知 + 引导 -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; color: #202124; margin: 0 0 16px; font-weight: 500; text-align: center;">恭喜您注册成功！</h2>

        <p style="margin: 0 0 20px; color: #333; font-size: 15px; line-height: 1.7;">
          您好，感谢您选择密钥管理系统！您的账号已创建完成${username}，可立即登录使用以下核心功能：
        </p>

        <!-- 功能亮点（简洁列表） -->
        <ul style="margin: 0 0 24px; padding-left: 20px; color: #5f6368; font-size: 14px; line-height: 1.8;">
          <li>安全存储密钥、密码等敏感信息</li>
          <li>一键生成高强度随机密码</li>
          <li>多设备同步，随时随地访问</li>
        </ul>

        <!-- 登录引导按钮 -->
        <div style="text-align: center; margin: 0 0 24px;">
          <a href="https://www.yuhuo863.top" style="display: inline-block; padding: 12px 28px; background: #4285F4; color: white; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 15px;">
            立即登录
          </a>
        </div>

        <p style="margin: 0; color: #666; font-size: 14px;">
          若按钮无法点击，请复制以下链接到浏览器打开：<br>
          <a href="https://www.yuhuo863.top" style="color: #4285F4; text-decoration: underline; word-break: break-all;">渔火</a>
        </p>
      </div>

      <!-- 底部信息 -->
      <div style="padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
        <p style="margin: 0 0 8px;">本邮件由系统自动发送，请勿直接回复。</p>
        <p style="margin: 0;">如果您不想接收此类邮件，请 <a href="https://www.yuhuo863.top" style="color: #4285F4; text-decoration: underline;">取消订阅</a>。</p>
      </div>
    </div>
  </body>
  </html>
  `;
