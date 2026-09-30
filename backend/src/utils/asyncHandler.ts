import type { Request, Response, NextFunction, RequestHandler } from "express";

/** 包装 async 控制器，把 reject 的错误转发给 errorHandlerMiddleware。 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => unknown): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
