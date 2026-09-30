import { seed } from "../seed";
import type { VersionedRepairTicket } from "../models/RepairTicket";
import type { VersionedCrew } from "../models/Crew";
import type { VersionedGridAsset } from "../models/GridAsset";
import type { VersionedFaultReport } from "../models/FaultReport";
import type { SparePartUsage } from "../models/SparePartUsage";

export interface AuditLogRow {
  id: number;
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  detail: string;
  created_at: string;
}

export interface DataSnapshot {
  repairTicket: VersionedRepairTicket[];
  crew: VersionedCrew[];
  gridAsset: VersionedGridAsset[];
  faultReport: VersionedFaultReport[];
  sparePartUsage: SparePartUsage[];
  auditLog: AuditLogRow[];
}

const INITIAL_VERSION = 1;

const withVersion = <T>(row: T): T & { version: number } => ({ ...row, version: INITIAL_VERSION });

const buildInitialState = (): DataSnapshot => ({
  repairTicket: seed.repairTicket.map(withVersion),
  crew: seed.crew.map(withVersion),
  gridAsset: seed.gridAsset.map(withVersion),
  faultReport: seed.faultReport.map(withVersion),
  sparePartUsage: seed.sparePartUsage.map((row) => ({ ...row })),
  auditLog: []
});

let state: DataSnapshot = buildInitialState();
let auditLogSeq = 0;

/** 测试与种子重置入口。 */
export const resetStore = (): void => {
  state = buildInitialState();
  auditLogSeq = 0;
};

export const getState = (): DataSnapshot => state;

export const nextAuditLogId = (): number => {
  auditLogSeq += 1;
  return auditLogSeq;
};

/**
 * 派工/复电会同时写 工单、班组、资产 三张“表”。
 * 事务期间先对三张表打快照，写入失败时按快照整体恢复，
 * 保证不会出现“班组已占用但工单没派出去”的半成功状态。
 */
export interface MutationScope {
  snapshot: Pick<DataSnapshot, "repairTicket" | "crew" | "gridAsset" | "faultReport">;
}

export const createMutationScope = (): MutationScope => ({
  snapshot: {
    repairTicket: state.repairTicket.map((row) => ({ ...row })),
    crew: state.crew.map((row) => ({ ...row })),
    gridAsset: state.gridAsset.map((row) => ({ ...row })),
    faultReport: state.faultReport.map((row) => ({ ...row }))
  }
});

export const rollbackScope = (scope: MutationScope): void => {
  state.repairTicket = scope.snapshot.repairTicket.map((row) => ({ ...row }));
  state.crew = scope.snapshot.crew.map((row) => ({ ...row }));
  state.gridAsset = scope.snapshot.gridAsset.map((row) => ({ ...row }));
  state.faultReport = scope.snapshot.faultReport.map((row) => ({ ...row }));
};
