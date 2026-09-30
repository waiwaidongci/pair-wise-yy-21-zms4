import type { ErrorRequestHandler } from "express";

interface AppError extends Error {
  status?: number;
  code?: string;
}

/** 统一错误响应：除 code/message 外，透传冲突工单、班组等附加字段。 */
export const errorHandlerMiddleware: ErrorRequestHandler = (err: AppError, _req, res, _next) => {
  const status = err.status ?? 500;
  const code = err.code ?? "INTERNAL_ERROR";
  const body: Record<string, unknown> = { code, message: err.message };
  const extra = err as unknown as Record<string, unknown>;
  for (const key of ["ticket", "crew", "requiredSkill", "reason"]) {
    if (extra[key] !== undefined) {
      body[key] = extra[key];
    }
  }
  res.status(status).json(body);
};
