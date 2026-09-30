import type { FaultReport } from "../types/FaultReport";

export const createDefaultFaultReport = (overrides: Partial<FaultReport> = {}): FaultReport => ({
  id: 0,
  reporter_name: "",
  phone: "",
  asset_id: 0,
  fault_type: "OUTAGE",
  address_desc: "",
  severity: "NORMAL",
  report_channel: "HOTLINE",
  status: "PENDING",
  version: 1,
  ...overrides
});

export const createFaultReportForm = createDefaultFaultReport;
export const createFaultReportResponse = createDefaultFaultReport;
