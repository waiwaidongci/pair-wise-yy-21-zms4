import type { GridAsset } from "../types/GridAsset";

export const createDefaultGridAsset = (overrides: Partial<GridAsset> = {}): GridAsset => ({
  id: 0,
  asset_code: "",
  asset_type: "LINE",
  feeder_line: "",
  voltage_level: "10kV",
  location_desc: "",
  health_status: "NORMAL",
  owner_team_id: null,
  version: 1,
  ...overrides
});

export const createGridAssetForm = createDefaultGridAsset;
export const createGridAssetResponse = createDefaultGridAsset;
