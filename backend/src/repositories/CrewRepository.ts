import { getState } from "./store";
import { compareAndSet, findRow, listRows, updateRow, type CompareAndSetResult } from "./versionedRepository";
import type { Crew, VersionedCrew } from "../models/Crew";
import type { DutyStatus } from "../constants/DutyStatus";

export const crewRepository = {
  findAll: (): VersionedCrew[] => listRows<VersionedCrew>("crew"),
  findById: (id: number): VersionedCrew | undefined => findRow<VersionedCrew>("crew", id),
  /** 班组占用/释放同样走比较写入，防止两位调度员同时把不同工单塞给同一班组。 */
  compareAndSet: (
    id: number,
    expectedVersion: number,
    patch: Partial<Omit<Crew, "id">>
  ): { result: CompareAndSetResult; current?: VersionedCrew } =>
    compareAndSet<VersionedCrew>("crew", id, expectedVersion, patch),
  /** 回滚用：按快照整行覆盖（含 version），不推进版本号。 */
  restore: (row: VersionedCrew): void => {
    const rows = getState().crew;
    const index = rows.findIndex((item) => item.id === row.id);
    if (index >= 0) rows[index] = { ...row };
  },
  updateDutyStatus: (id: number, duty_status: DutyStatus): VersionedCrew | undefined =>
    updateRow<VersionedCrew>("crew", id, { duty_status }),
  save: (row: Crew): Crew => row
};
