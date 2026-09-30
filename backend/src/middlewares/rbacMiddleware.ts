import type { Request, Response, RequestHandler } from "express";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

interface AuthedRequest extends Request {
  user?: { id: number; role: string };
}

/** 角色鉴权：dispatcher 可派工；admin 全放行；其余角色拒绝。 */
export const rbacMiddleware = (...allowedRoles: string[]): RequestHandler => {
  return (req: AuthedRequest, res: Response, next) => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ code: ERROR_CODES.AUTH_REQUIRED, message: ERROR_MESSAGES.AUTH_REQUIRED });
      return;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      res.status(403).json({ code: ERROR_CODES.RBAC_DENIED, message: ERROR_MESSAGES.RBAC_DENIED });
      return;
    }
    next();
  };
};
