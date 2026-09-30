import type { VersionedFaultReport } from "../models/FaultReport";
import type { VersionedGridAsset } from "../models/GridAsset";
import type { VersionedRepairTicket } from "../models/RepairTicket";
import type { VersionedCrew } from "../models/Crew";

/** 派工临界区内使用的快照：校验依据 + 失败回滚目标。 */
export interface DispatchSnapshot {
  ticket: VersionedRepairTicket;
  crew: VersionedCrew;
  faultReport: VersionedFaultReport;
  asset: VersionedGridAsset | null;
}
