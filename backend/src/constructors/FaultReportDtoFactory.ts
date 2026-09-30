import type { VersionedFaultReport } from "../models/FaultReport";
import type { FaultReport } from "../models/FaultReport";

export interface FaultReportDto extends FaultReport {
  version: number;
}

export const createFaultReportDto = (row: VersionedFaultReport): FaultReportDto => {
  const { version, ...fields } = row;
  return { ...fields, version };
};

export const createFaultReportDtoList = (rows: VersionedFaultReport[]): FaultReportDto[] =>
  rows.map(createFaultReportDto);
