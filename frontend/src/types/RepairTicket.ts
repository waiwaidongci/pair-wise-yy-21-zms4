import type { TicketStatus } from "./TicketStatus";
import type { Priority } from "./Priority";

export interface RepairTicket {
  id: number;
  fault_report_id: number;
  team_id: number | null;
  dispatcher_id: number | null;
  priority: Priority;
  status: TicketStatus;
  assigned_at: string | null;
  restored_at: string | null;
  version: number;
}
