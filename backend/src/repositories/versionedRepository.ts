import { getState, type DataSnapshot } from "./store";

/**
 * 乐观锁更新结果：
 * - MISS：记录不存在
 * - VERSION_STALE：版本号已被其他调度员推进（并发落败）
 * - OK：写入成功，行的 version 自增
 */
export type CompareAndSetResult = "OK" | "MISS" | "VERSION_STALE";

interface VersionedRow {
  id: number;
  version: number;
}

type TableKey = "repairTicket" | "crew" | "gridAsset" | "faultReport";

export const findRow = <T extends VersionedRow>(table: TableKey, id: number): T | undefined =>
  (getState()[table] as unknown as T[]).find((row) => row.id === id);

export const listRows = <T>(table: TableKey): T[] =>
  [...(getState()[table] as unknown as T[])];

export const compareAndSet = <T extends VersionedRow>(
  table: TableKey,
  id: number,
  expectedVersion: number,
  patch: Partial<Omit<T, "id" | "version">>
): { result: CompareAndSetResult; current?: T } => {
  const rows = getState()[table] as unknown as T[];
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) return { result: "MISS" };
  const current = rows[index];
  if (current.version !== expectedVersion) return { result: "VERSION_STALE", current };
  rows[index] = { ...current, ...patch, version: current.version + 1 };
  return { result: "OK", current: rows[index] };
};

/** 不带版本断言的直接更新（当值切换等单人操作同样推进版本，使旧候选失效）。 */
export const updateRow = <T extends VersionedRow>(
  table: TableKey,
  id: number,
  patch: Partial<Omit<T, "id" | "version">>
): T | undefined => {
  const rows = getState()[table] as unknown as T[];
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) return undefined;
  rows[index] = { ...rows[index], ...patch, version: rows[index].version + 1 };
  return rows[index];
};

export type { DataSnapshot };
