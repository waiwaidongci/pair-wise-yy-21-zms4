import type { RequestHandler } from "express";

export interface AuthUser {
  id: number;
  role: string;
  name: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * 本地演示鉴权（JWT 在网关侧签发后落到 x-* 头）：
 * 默认两位调度员通过 x-dispatcher-id 区分，便于复现并发派工。
 */
export const authMiddleware: RequestHandler = (req, _res, next) => {
  const id = Number(req.header("x-dispatcher-id") ?? req.header("x-user-id") ?? 1);
  req.user = {
    id: Number.isFinite(id) && id > 0 ? id : 1,
    role: req.header("x-role") ?? "DISPATCHER",
    name: req.header("x-dispatcher-name") ?? `调度员${id}`
  };
  next();
};
