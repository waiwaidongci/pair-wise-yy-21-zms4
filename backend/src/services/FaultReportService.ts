import { faultReportRepository } from "../repositories/FaultReportRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { FaultReport } from "../models/FaultReport";

export const faultReportService = {
  list(): FaultReport[] {
    return faultReportRepository.findAll();
  },
  findById(id: number): FaultReport | undefined {
    return faultReportRepository.findById(id);
  },
  create(row: Partial<FaultReport>): FaultReport {
    if (!row.reporter_name || !row.asset_id || !row.fault_type) {
      const err = new Error(ERROR_MESSAGES.VALIDATION_FAILED) as Error & { status: number; code: string };
      err.status = 400;
      err.code = ERROR_CODES.VALIDATION_FAILED;
      throw err;
    }
    const created: FaultReport = {
      id: Date.now(),
      reporter_name: row.reporter_name,
      phone: row.phone ?? "",
      asset_id: row.asset_id,
      fault_type: row.fault_type,
      address_desc: row.address_desc ?? "",
      severity: row.severity ?? "MEDIUM",
      report_channel: row.report_channel ?? "PHONE",
      status: row.status ?? "REPORTED"
    };
    console.info(LOG_TEMPLATES.FaultReport[0], created.reporter_name);
    faultReportRepository.findAll().push(created);
    return created;
  }
};
