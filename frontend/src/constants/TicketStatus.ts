export const TicketStatus = [
  "WAIT_DISPATCH",
  "ASSIGNED",
  "ARRIVED",
  "REPAIRING",
  "RESTORED",
  "CLOSED"
] as const;
export type TicketStatus = (typeof TicketStatus)[number];

export const OpenTicketStatuses: TicketStatus[] = [
  "WAIT_DISPATCH",
  "ASSIGNED",
  "ARRIVED",
  "REPAIRING"
];

/** 与后端 TicketStatusFlow 对齐的工单状态机。 */
export const TicketStatusFlow: Record<TicketStatus, TicketStatus | null> = {
  WAIT_DISPATCH: "ASSIGNED",
  ASSIGNED: "ARRIVED",
  ARRIVED: "REPAIRING",
  REPAIRING: "RESTORED",
  RESTORED: "CLOSED",
  CLOSED: null
};

export const TicketStatusText: Record<TicketStatus, string> = {
  WAIT_DISPATCH: "待派工",
  ASSIGNED: "已派工",
  ARRIVED: "已到场",
  REPAIRING: "抢修中",
  RESTORED: "已复电",
  CLOSED: "已归档"
};

export const TicketStatusTone: Record<TicketStatus, "muted" | "info" | "warn" | "danger" | "ok"> = {
  WAIT_DISPATCH: "danger",
  ASSIGNED: "info",
  ARRIVED: "warn",
  REPAIRING: "warn",
  RESTORED: "ok",
  CLOSED: "muted"
};
