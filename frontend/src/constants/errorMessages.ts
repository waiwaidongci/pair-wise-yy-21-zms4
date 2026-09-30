export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  TICKET_NOT_FOUND: "抢修工单不存在",
  CREW_NOT_FOUND: "抢修班组不存在",
  ASSET_NOT_FOUND: "配网资产不存在",
  FAULT_REPORT_NOT_FOUND: "故障报修单不存在",
  DISPATCH_VERSION_CONFLICT: "该工单已被另一位调度员抢先派出，候选班组已重新计算，请确认后再派",
  DISPATCH_STATUS_CHANGED: "工单状态已变化，待派候选已失效并重新计算",
  CREW_NOT_AVAILABLE: "该班组已不再满足派工条件",
  SKILL_NOT_MATCHED: "班组技能与故障类型不匹配",
  CREW_NOT_ON_DUTY: "班组当前不在当值",
  CREW_BUSY: "班组手上还有未结工单",
  ILLEGAL_TICKET_TRANSITION: "工单状态流转不合法",
  DISPATCH_WRITE_FAILED: "派工写入失败，工单与班组状态已回滚，未产生半成功数据，请重试"
} as const;

export type ErrorCodeKey = keyof typeof ERROR_MESSAGES;
