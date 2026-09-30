import type { FaultType } from "./FaultType";

export interface FaultReport {
  id: number;
  reporter_name: string;
  phone: string;
  asset_id: number;
  fault_type: FaultType;
  address_desc: string;
  severity: string;
  report_channel: string;
  status: string;
  version: number;
}
