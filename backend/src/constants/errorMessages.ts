export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "缺少身份凭证，请重新登录",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "请求参数缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  NOT_FOUND: "目标记录不存在",
  CONFLICT: "数据状态已变更，请刷新后重试",
  TICKET_ALREADY_DISPATCHED: "该工单已被其他调度员派工，不能重复派工",
  TICKET_NOT_DISPATCHABLE: "当前工单状态不允许派工",
  CREW_UNAVAILABLE: "所选班组当前不可承接该工单",
  CREW_NOT_ON_DUTY: "所选班组当前不在值班",
  CREW_SKILL_MISMATCH: "所选班组技能与故障类型不匹配",
  CREW_HAS_OPEN_TICKET: "所选班组尚有未结工单，不能重复派工",
  ASSET_NOT_FOUND: "工单关联的配网资产不存在，派工已回滚",
  INVALID_STATUS_TRANSITION: "工单状态流转不合法",
  DISPATCH_FAILED: "派工写入失败，已恢复原状态"
};
