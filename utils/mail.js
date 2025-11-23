const nodemailer = require("nodemailer");

/**
 * 发件箱配置
 */
const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  secure: process.env.MAILER_SECURE,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
});

/**
 * 发送邮件
 * @param email 邮箱地址
 * @param subject 邮件主题
 * @param html 邮件模板
 * @returns {Promise<void>}
 */
const sendMail = async (email, subject, html) => {
  await transporter.sendMail({
    from: process.env.MAILER_USER,
    to: email,
    subject,
    html,
  });
};

module.exports = sendMail;
