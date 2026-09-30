export class ApiError extends Error {
  status: number;
  code: string;
  body: Record<string, unknown>;

  constructor(status: number, body: Record<string, unknown> | null) {
    super((body?.message as string) ?? `HTTP ${status}`);
    this.status = status;
    this.code = (body?.code as string) ?? "HTTP_ERROR";
    this.body = body ?? {};
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

/** 统一请求封装：非 2xx 抛 ApiError，由 store/页面按 code（如 409 冲突）处理。 */
export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      // 与后端 authMiddleware 约定的调度员角色，用于派工 RBAC。
      "x-role": "dispatcher",
      ...(options.headers ?? {})
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  let body: Record<string, unknown> | null = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text) as Record<string, unknown>;
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, body);
  }
  return body as T;
}
