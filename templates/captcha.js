module.exports = (code) => `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>验证码</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <!-- 品牌标识 -->
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
        <h1 style="margin: 0; font-size: 22px; color: #202124; font-weight: 600;">密钥管理系统</h1>
      </div>

      <!-- 核心内容：仅展示验证码 -->
      <div style="margin-bottom: 30px; text-align: center;">
        <p style="margin: 0 0 24px; color: #333; font-size: 15px;">您的验证码是</p>
        <span style="display: inline-block; padding: 14px 32px; background: #F1F7FE; border-radius: 6px; font-size: 24px; font-weight: 600; color: #4285F4; letter-spacing: 6px;">${code}</span>
      </div>

      <!-- 安全提示 -->
      <div style="background: #f8f9fa; padding: 16px; border-radius: 4px; margin: 0 0 24px;">
        <p style="margin: 0; color: #5f6368; font-size: 14px; line-height: 1.6;">
          验证码有效期15分钟，请勿泄露给他人<br>
          若未发起相关操作，可忽略本邮件
        </p>
      </div>

      <!-- 底部信息 -->
      <div style="padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
        <p style="margin: 0;">本邮件由系统自动发送，请勿直接回复</p>
      </div>
    </div>
  </body>
  </html>
  `;
