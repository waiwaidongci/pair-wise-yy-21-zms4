import type { RequestHandler } from "express";
import { BusinessError } from "../utils/errors";
import { ERROR_CODES } from "../constants/errorCodes";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 240;

const buckets = new Map<string, { count: number; resetAt: number }>();

/** 固定窗口内存限流：默认每分钟 240 次，超限返回 RATE_LIMITED。 */
export const rateLimitMiddleware: RequestHandler = (req, res, next) => {
  if (req.path === "/health") return next();
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }
  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    res.setHeader("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
    return next(new BusinessError(ERROR_CODES.RATE_LIMITED, {}, 429));
  }
  next();
};
