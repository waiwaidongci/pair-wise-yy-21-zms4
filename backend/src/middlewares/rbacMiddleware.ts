import type { RequestHandler } from "express";
import { BusinessError } from "../utils/errors";
import { ERROR_CODES } from "../constants/errorCodes";

/**
 * RBAC：派工/复电等写操作只允许 DISPATCHER / ADMIN。
 * 失败时由 service/controller 之外的中间件直接给 403。
 */
export const rbacMiddleware =
  (roles: string[] = []): RequestHandler =>
  (req, _res, next) => {
    const userRole = req.user?.role ?? "GUEST";
    if (roles.length === 0 || roles.includes(userRole)) return next();
    next(new BusinessError(ERROR_CODES.RBAC_DENIED, { role: userRole }, 403));
  };
