import { gridAssetRepository } from "../repositories/GridAssetRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { GridAsset } from "../models/GridAsset";

export const gridAssetService = {
  list(): GridAsset[] {
    return gridAssetRepository.findAll();
  },
  findById(id: number): GridAsset | undefined {
    return gridAssetRepository.findById(id);
  },
  create(row: Partial<GridAsset>): GridAsset {
    if (!row.asset_code || !row.asset_type) {
      const err = new Error(ERROR_MESSAGES.VALIDATION_FAILED) as Error & { status: number; code: string };
      err.status = 400;
      err.code = ERROR_CODES.VALIDATION_FAILED;
      throw err;
    }
    const created: GridAsset = {
      id: Date.now(),
      asset_code: row.asset_code,
      asset_type: row.asset_type,
      feeder_line: row.feeder_line ?? "",
      voltage_level: row.voltage_level ?? "",
      location_desc: row.location_desc ?? "",
      health_status: row.health_status ?? "NORMAL",
      owner_team_id: row.owner_team_id ?? 0
    };
    console.info(LOG_TEMPLATES.GridAsset[0], created.asset_code);
    gridAssetRepository.findAll().push(created);
    return created;
  }
};
