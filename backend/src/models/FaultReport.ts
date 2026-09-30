import type { FaultType } from "../constants/FaultType";

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
}

export interface VersionedFaultReport extends FaultReport {
  version: number;
}
