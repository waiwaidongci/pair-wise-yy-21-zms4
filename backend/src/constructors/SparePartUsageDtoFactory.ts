import type { SparePartUsage } from "../models/SparePartUsage";

export type SparePartUsageDto = SparePartUsage;

export const createSparePartUsageDto = (row: SparePartUsage): SparePartUsageDto => ({ ...row });

export const createSparePartUsageDtoList = (rows: SparePartUsage[]): SparePartUsageDto[] =>
  rows.map(createSparePartUsageDto);
