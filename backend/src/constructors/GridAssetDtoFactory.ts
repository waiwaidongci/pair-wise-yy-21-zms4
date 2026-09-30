import type { VersionedGridAsset } from "../models/GridAsset";
import type { GridAsset } from "../models/GridAsset";

export interface GridAssetDto extends GridAsset {
  version: number;
}

export const createGridAssetDto = (row: VersionedGridAsset): GridAssetDto => {
  const { version, ...fields } = row;
  return { ...fields, version };
};

export const createGridAssetDtoList = (rows: VersionedGridAsset[]): GridAssetDto[] =>
  rows.map(createGridAssetDto);
