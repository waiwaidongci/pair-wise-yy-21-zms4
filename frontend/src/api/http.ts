import { ERROR_MESSAGES, type ErrorCodeKey } from "../constants/errorMessages";
import type { DispatchConflictError } from "../types/Dispatch";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  isConflict(): this is ApiError & { details: DispatchConflictError["details"] } {
    return this.status === 409;
  }
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  /** 联调注入：模拟三实体写入中途失败（afterTicket / afterCrew）。 */
  simulateWriteFailure?: "afterTicket" | "afterCrew";
  dispatcher?: { id: number; name: string; role: string };
}

const readDispatcherHeaders = (options?: RequestOptions): Record<string, string> => {
  const headers: Record<string, string> = {};
  const dispatcher = options?.dispatcher;
  if (dispatcher) {
    headers["x-dispatcher-id"] = String(dispatcher.id);
    headers["x-dispatcher-name"] = dispatcher.name;
    headers["x-role"] = dispatcher.role;
  }
  if (options?.simulateWriteFailure) {
    headers["x-simulate-write-failure"] = options.simulateWriteFailure;
  }
  return headers;
};

export const requestJson = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const res = await fetch(path, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...readDispatcherHeaders(options)
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  if (!res.ok) {
    let payload: { code?: string; message?: string; details?: unknown } = {};
    try {
      payload = (await res.json()) as typeof payload;
    } catch {
      // 非 JSON 错误响应保留默认消息
    }
    const code = payload.code ?? "INTERNAL_ERROR";
    const fallback = ERROR_MESSAGES[code as ErrorCodeKey];
    throw new ApiError(
      res.status,
      code,
      payload.message || fallback || `请求失败（${res.status}）`,
      payload.details
    );
  }
  return (await res.json()) as T;
};
