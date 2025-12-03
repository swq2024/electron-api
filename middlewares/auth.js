const { verifyToken } = require("../services/authService");
const { User, Session } = require("../models");
const { sendErr } = require("../utils/response");
const { isBlacklisted } = require("../services/blacklistService");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return sendErr(res, {
        isOperational: true,
        statusCode: 400,
        message: "缺少认证信息[Authorization]",
      });
    }
    if (!authHeader.startsWith("Bearer ")) {
      return sendErr(res, {
        isOperational: true,
        statusCode: 400,
        message: "认证信息格式不正确",
      });
    }

    const token = authHeader.substring(7); // 从Bearer Token中提取令牌值

    /**
         * 例如：decoded =
         * {
                userId: '70a74745-7323-476d-a700-5db94bb34d15',
                role: 'user',
                // 令牌签发时间戳 全称是Issued At 令牌签发时间戳，表示该令牌是在何时生成的。这对于追踪和调试是有用的，尤其是在需要确定令牌的时效性时。
                iat: 1762865370,
                // 令牌过期时间戳 全称是Expiration Time 令牌过期时间戳，表示该令牌在何时失效。一旦过了这个时间点，就不能再使用它来访问受保护的资源了。
                exp: 1765457370
            }
         */
    const decoded = verifyToken(token); // 验证AT令牌的有效性

    if (!decoded) {
      return sendErr(res, {
        isOperational: true,
        statusCode: 401,
        message: "无效的令牌",
      });
    }

    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return sendErr(res, {
        isOperational: true,
        statusCode: 401,
        message: "认证信息无效，请重新登录",
      });
    }
    if (!user.isActive) {
      return sendErr(res, {
        isOperational: true,
        statusCode: 403,
        message: "账户已被禁用，无法访问",
      });
    }

    // 检查token版本是否与数据库中一致, 用于用户主动修改密码后自动失效所有旧令牌
    if (user.tokenVersion !== decoded.token_version) {
      return sendErr(res, {
        isOperational: true,
        statusCode: 401,
        message: "令牌版本不匹配",
      });
    }

    // 检查AT令牌是否在黑名单中
    const isInBlacklisted = await isBlacklisted(decoded.jti);
    if (isInBlacklisted) {
      return sendErr(res, {
        isOperational: true,
        statusCode: 401,
        message: "令牌已被撤销",
      });
    }

    // 检查当前用户现有会话是否存在
    const session = await Session.findOne({
      where: {
        userId: user.id,
      },
    });
    if (!session || session.expiresAt < Date.now()) {
      return sendErr(res, {
        isOperational: true,
        statusCode: 401,
        message: "会话已过期或已被注销",
      });
    }

    req.user = user; // 将用户信息附加到请求对象上
    req.token = token; // 将令牌附加到请求对象上
    req.tokenJti = decoded.jti; // 将令牌唯一标识符附加到请求对象上

    next();
  } catch (error) {
    console.error("认证失败", error);
    return sendErr(res, error);
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendErr(res, {
        isOperational: true,
        statusCode: 401,
        message: "用户未登录或会话已过期",
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return sendErr(res, {
        isOperational: true,
        statusCode: 403,
        message: "权限不足",
      });
    }

    next();
  };
};

const identifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendErr(res, {
        statusCode: 400,
        message: "缺少或格式不正确的认证信息",
      });
    }
    const token = authHeader.substring(7);

    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return sendErr(res, {
        statusCode: 401,
        message: "用户不存在或身份验证失败",
      });
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    // 捕获签名验证失败（如 AT 过期）的错误，但依然返回 401
    // 这里的错误处理应该比 auth.js 宽松，只处理 token 格式和签名本身的问题
    return sendErr(res, {
      isOperational: true,
      statusCode: 401,
      message: "令牌无效或已过期",
    });
  }
};

module.exports = {
  authenticate,
  requireRole,
  identifyUser,
};
