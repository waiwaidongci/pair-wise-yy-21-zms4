import type { ErrorRequestHandler } from "express";

/** 全局兜底：service(BusinessError) -> controller(ControllerError) 都会带 code/status/details。 */
export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err.status ?? 500;
  const body: Record<string, unknown> = {
    code: err.code ?? "INTERNAL_ERROR",
    message: err.message ?? "internal error"
  };
  if (err.details !== undefined) body.details = err.details;
  if (status >= 500) console.error("[error-handler]", err);
  res.status(status).json(body);
};
