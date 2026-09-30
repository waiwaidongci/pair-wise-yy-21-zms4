export const TicketStatus = [
  "WAIT_DISPATCH",
  "ASSIGNED",
  "ARRIVED",
  "REPAIRING",
  "RESTORED",
  "CLOSED"
] as const;
export type TicketStatus = (typeof TicketStatus)[number];

/** 工单状态机：状态流转只允许沿该映射向前。 */
export const TicketStatusFlow: Record<TicketStatus, TicketStatus | null> = {
  WAIT_DISPATCH: "ASSIGNED",
  ASSIGNED: "ARRIVED",
  ARRIVED: "REPAIRING",
  REPAIRING: "RESTORED",
  RESTORED: "CLOSED",
  CLOSED: null
};

/** 仍占用班组的未结工单状态；RESTORED/CLOSED 视为已结。 */
export const OpenTicketStatuses: TicketStatus[] = [
  "WAIT_DISPATCH",
  "ASSIGNED",
  "ARRIVED",
  "REPAIRING"
];

export const isOpenTicketStatus = (status: string): boolean =>
  (OpenTicketStatuses as readonly string[]).includes(status);
