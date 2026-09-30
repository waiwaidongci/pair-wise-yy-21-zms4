import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { SparePartUsage } from "../models/SparePartUsage";

export const sparePartUsageService = {
  list(): SparePartUsage[] {
    return sparePartUsageRepository.findAll();
  },
  findById(id: number): SparePartUsage | undefined {
    return sparePartUsageRepository.findById(id);
  },
  create(row: Partial<SparePartUsage>): SparePartUsage {
    if (!row.ticket_id || !row.part_code) {
      const err = new Error(ERROR_MESSAGES.VALIDATION_FAILED) as Error & { status: number; code: string };
      err.status = 400;
      err.code = ERROR_CODES.VALIDATION_FAILED;
      throw err;
    }
    const created: SparePartUsage = {
      id: Date.now(),
      ticket_id: row.ticket_id,
      part_code: row.part_code,
      part_name: row.part_name ?? "",
      quantity: row.quantity ?? 1,
      warehouse_name: row.warehouse_name ?? "",
      approved_by: row.approved_by ?? "",
      usage_status: row.usage_status ?? "PENDING"
    };
    console.info(LOG_TEMPLATES.SparePartUsage[0], created.part_code);
    sparePartUsageRepository.findAll().push(created);
    return created;
  }
};
