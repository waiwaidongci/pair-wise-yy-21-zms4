import type { Crew } from "./Crew";
import type { GridAsset } from "./GridAsset";

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

/** 派工结果：工单、班组、配网资产同时更新 */
export interface DispatchResult {
  ticket: RepairTicket;
  crew: Crew;
  asset: GridAsset;
}

/** 派工冲突：落败方拿到的获胜工单/班组 */
export interface ConflictInfo {
  code: string;
  message: string;
  ticket?: RepairTicket;
  crew?: Crew;
  requiredSkill?: string;
}
