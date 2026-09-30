import type { RequestHandler } from "express";

/**
 * 访问级审计：写请求统一记录入口日志。
 * 业务级审计（派工/复电/当值切换的字段级模板）在 utils/auditLogger 内落 audit_log 表。
 */
export const auditLogMiddleware: RequestHandler = (req, _res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const actor = req.user ? `${req.user.role}#${req.user.id}` : "anonymous";
    console.info(`[audit-entry] ${req.method} ${req.originalUrl} by ${actor}`);
  }
  next();
};
