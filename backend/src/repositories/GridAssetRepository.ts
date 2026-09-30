import { getState } from "./store";
import { findRow, listRows, updateRow } from "./versionedRepository";
import type { GridAsset, VersionedGridAsset } from "../models/GridAsset";

export const gridAssetRepository = {
  findAll: (): VersionedGridAsset[] => listRows<VersionedGridAsset>("gridAsset"),
  findById: (id: number): VersionedGridAsset | undefined =>
    findRow<VersionedGridAsset>("gridAsset", id),
  /** 派工联动：资产健康状态随工单处理推进，复电后回落到 WATCH。 */
  updateHealthStatus: (id: number, health_status: string): VersionedGridAsset | undefined =>
    updateRow<VersionedGridAsset>("gridAsset", id, { health_status }),
  /** 回滚用：按快照整行覆盖（含 version），不推进版本号。 */
  restore: (row: VersionedGridAsset): void => {
    const rows = getState().gridAsset;
    const index = rows.findIndex((item) => item.id === row.id);
    if (index >= 0) rows[index] = { ...row };
  },
  save: (row: GridAsset): GridAsset => row
};
