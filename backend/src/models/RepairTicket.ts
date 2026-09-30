export interface RepairTicket {
  id: number;
  fault_report_id: number;
  team_id: number | null;
  dispatcher_id: number | null;
  priority: string;
  status: string;
  assigned_at: string | null;
  restored_at: string | null;
}
