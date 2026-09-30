import type { TicketStatus } from "../constants/TicketStatus";
import type { Priority } from "../constants/Priority";

export interface RepairTicket {
  id: number;
  fault_report_id: number;
  team_id: number | null;
  dispatcher_id: number | null;
  priority: Priority;
  status: TicketStatus;
  assigned_at: string | null;
  restored_at: string | null;
}

/**
 * 存储记录在业务字段之外带一个乐观锁版本号。
 * 两位调度员同时派工时，只有版本号仍匹配的一笔可以提交。
 */
export interface VersionedRepairTicket extends RepairTicket {
  version: number;
}
