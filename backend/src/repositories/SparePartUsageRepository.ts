import { db } from "../db";
import type { SparePartUsage } from "../models/SparePartUsage";

export const sparePartUsageRepository = {
  findAll(): SparePartUsage[] {
    return db.sparePartUsages;
  },
  findById(id: number): SparePartUsage | undefined {
    return db.sparePartUsages.find((usage) => usage.id === id);
  },
  update(id: number, patch: Partial<SparePartUsage>): SparePartUsage | undefined {
    const usage = this.findById(id);
    if (!usage) return undefined;
    Object.assign(usage, patch);
    return usage;
  }
};
