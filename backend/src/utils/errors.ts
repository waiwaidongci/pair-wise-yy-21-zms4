import { ERROR_CODES, type ErrorCode } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

/** service 层抛出的业务异常，controller 层会再次包装后交给全局错误中间件。 */
export class BusinessError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    code: ErrorCode,
    params: Record<string, string | number> = {},
    status = 400,
    details?: unknown
  ) {
    const template = ERROR_MESSAGES[code] ?? code;
    super(template.replace(/\{(\w+)\}/g, (_m, key) => String(params[key] ?? "")));
    this.name = "BusinessError";
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static notFound(code: ErrorCode, id: number | string) {
    return new BusinessError(code, { id }, 404);
  }

  /** 派工并发冲突：409，同时带回冲突工单与重算后的候选。 */
  static conflict(code: ErrorCode, params: Record<string, string | number>, details?: unknown) {
    return new BusinessError(code, params, 409, details);
  }
}

export { ERROR_CODES };
