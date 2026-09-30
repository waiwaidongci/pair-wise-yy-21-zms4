import type { RequestHandler } from "express";

/**
 * service 抛 BusinessError，controller 层必须各自再包一层 ControllerError，
 * 不允许只靠全局错误中间件吞掉（见 errorCodes/errorMessages 分层要求）。
 */
export class ControllerError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(source: { status?: number; code?: string; message: string; details?: unknown }) {
    super(`[controller] ${source.message}`);
    this.name = "ControllerError";
    this.status = source.status ?? 500;
    this.code = source.code ?? "CONTROLLER_ERROR";
    this.details = source.details;
  }
}

export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      if (err instanceof ControllerError) return next(err);
      const code = (err as { code?: string }).code;
      const status = (err as { status?: number }).status ?? 500;
      const details = (err as { details?: unknown }).details;
      next(new ControllerError({ status, code, message: (err as Error).message, details }));
    });
  };
