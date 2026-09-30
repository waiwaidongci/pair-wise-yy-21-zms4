import { getState } from "./store";
import { compareAndSet, findRow, listRows, updateRow, type CompareAndSetResult } from "./versionedRepository";
import type { RepairTicket, VersionedRepairTicket } from "../models/RepairTicket";
import type { TicketStatus } from "../constants/TicketStatus";
import type { Priority } from "../constants/Priority";

export const repairTicketRepository = {
  findAll: (): VersionedRepairTicket[] => listRows<VersionedRepairTicket>("repairTicket"),
  findById: (id: number): VersionedRepairTicket | undefined =>
    findRow<VersionedRepairTicket>("repairTicket", id),
  /** 派工提交用：带版本号的比较写入。 */
  compareAndSet: (
    id: number,
    expectedVersion: number,
    patch: Partial<Omit<RepairTicket, "id">>
  ): { result: CompareAndSetResult; current?: VersionedRepairTicket } =>
    compareAndSet<VersionedRepairTicket>("repairTicket", id, expectedVersion, patch),
  /** 回滚/补偿用：不经版本断言的恢复写入。 */
  restore: (row: VersionedRepairTicket): void => {
    const rows = getState().repairTicket;
    const index = rows.findIndex((item) => item.id === row.id);
    if (index >= 0) rows[index] = { ...row };
  },
  updateStatus: (
    id: number,
    patch: { status: TicketStatus; restored_at?: string | null }
  ): VersionedRepairTicket | undefined =>
    updateRow<VersionedRepairTicket>("repairTicket", id, patch),
  /** 仍占用班组的未结工单。 */
  findOpenByTeam: (teamId: number): VersionedRepairTicket | undefined =>
    getState().repairTicket.find(
      (ticket) => ticket.team_id === teamId && ["ASSIGNED", "ARRIVED", "REPAIRING"].includes(ticket.status)
    ),
  isPriority: (value: string): value is Priority =>
    (["NORMAL", "HIGH", "URGENT"] as const).includes(value as Priority)
};
