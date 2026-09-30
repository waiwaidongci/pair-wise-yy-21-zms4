import { seed } from "./seed";
import type { Crew } from "./models/Crew";
import type { GridAsset } from "./models/GridAsset";
import type { FaultReport } from "./models/FaultReport";
import type { RepairTicket } from "./models/RepairTicket";
import type { SparePartUsage } from "./models/SparePartUsage";

export interface AuditLogRow {
  id: number;
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  created_at: string;
}

export interface Database {
  crews: Crew[];
  gridAssets: GridAsset[];
  faultReports: FaultReport[];
  repairTickets: RepairTicket[];
  sparePartUsages: SparePartUsage[];
  auditLogs: AuditLogRow[];
}

/**
 * 运行期数据快照。当前骨架使用内存表，dispatch 事务依赖它做整体回滚。
 * 若后续切换为 Prisma/MySQL，withTransaction 可替换为真实数据库事务。
 */
function clone<T>(value: T): T {
  return structuredClone(value);
}

export const db: Database = clone(seed) as Database;

/**
 * 按 key 串行化的异步互斥锁。
 * 两位调度员同时派同一单时，后到的一方必须等先到的一方提交后再判定，
 * 从而只能有一笔成立。
 */
const waiters = new Map<string, Promise<void>>();

export async function withLock<T>(key: string, fn: () => T | Promise<T>): Promise<T> {
  const prev = waiters.get(key) ?? Promise.resolve();
  let release!: () => void;
  const next = new Promise<void>((resolve) => {
    release = resolve;
  });
  waiters.set(key, prev.then(() => next));
  await prev;
  try {
    return await fn();
  } finally {
    release();
    if (waiters.get(key) === next) {
      waiters.delete(key);
    }
  }
}

/**
 * 事务边界：进入时对整库做快照，fn 抛错则把所有表恢复到快照状态，
 * 保证“班组已占用但工单未派”这类中间态不会残留。
 */
export function withTransaction<T>(fn: (tx: Database) => T): T {
  const snapshot = clone(db);
  try {
    return fn(db);
  } catch (err) {
    for (const key of Object.keys(snapshot) as Array<keyof Database>) {
      (db as unknown as Record<string, unknown>)[key] = clone(snapshot[key]);
    }
    throw err;
  }
}
