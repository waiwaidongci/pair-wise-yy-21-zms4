import { db } from "../db";
import type { FaultReport } from "../models/FaultReport";

export const faultReportRepository = {
  findAll(): FaultReport[] {
    return db.faultReports;
  },
  findById(id: number): FaultReport | undefined {
    return db.faultReports.find((report) => report.id === id);
  },
  update(id: number, patch: Partial<FaultReport>): FaultReport | undefined {
    const report = this.findById(id);
    if (!report) return undefined;
    Object.assign(report, patch);
    return report;
  }
};
