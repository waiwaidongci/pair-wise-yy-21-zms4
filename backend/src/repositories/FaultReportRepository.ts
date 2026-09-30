import { getState } from "./store";
import { findRow, listRows, updateRow } from "./versionedRepository";
import type { FaultReport, VersionedFaultReport } from "../models/FaultReport";

export const faultReportRepository = {
  findAll: (): VersionedFaultReport[] => listRows<VersionedFaultReport>("faultReport"),
  findById: (id: number): VersionedFaultReport | undefined =>
    findRow<VersionedFaultReport>("faultReport", id),
  updateStatus: (id: number, status: string): VersionedFaultReport | undefined =>
    updateRow<VersionedFaultReport>("faultReport", id, { status }),
  /** 回滚用：按快照整行覆盖（含 version），不推进版本号。 */
  restore: (row: VersionedFaultReport): void => {
    const rows = getState().faultReport;
    const index = rows.findIndex((item) => item.id === row.id);
    if (index >= 0) rows[index] = { ...row };
  },
  save: (row: FaultReport): FaultReport => row
};
