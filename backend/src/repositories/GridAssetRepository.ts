import { db } from "../db";
import type { GridAsset } from "../models/GridAsset";

export const gridAssetRepository = {
  findAll(): GridAsset[] {
    return db.gridAssets;
  },
  findById(id: number): GridAsset | undefined {
    return db.gridAssets.find((asset) => asset.id === id);
  },
  update(id: number, patch: Partial<GridAsset>): GridAsset | undefined {
    const asset = this.findById(id);
    if (!asset) return undefined;
    Object.assign(asset, patch);
    return asset;
  }
};
