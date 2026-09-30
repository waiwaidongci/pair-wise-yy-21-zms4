import type { TicketStatus } from "../constants/TicketStatus";

/** 工单状态流转请求体。 */
export interface RepairTicketTransitionPayload {
  ticketId: number;
  version: number;
  action: "ARRIVE" | "REPAIR" | "RESTORE" | "CLOSE";
}

export type RepairTicketPayload = Partial<{
  fault_report_id: number;
  priority: string;
  status: TicketStatus;
}>;
