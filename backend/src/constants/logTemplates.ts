export const LOG_TEMPLATES = {
  GridAsset: ["GridAsset.create", "GridAsset.update", "GridAsset.status", "GridAsset.export", "GridAsset.ownerChange"],
  FaultReport: ["FaultReport.create", "FaultReport.update", "FaultReport.status", "FaultReport.export", "FaultReport.merged"],
  RepairTicket: ["RepairTicket.create", "RepairTicket.update", "RepairTicket.status", "RepairTicket.export", "RepairTicket.dispatch", "RepairTicket.conflict", "RepairTicket.transition", "RepairTicket.restore"],
  Crew: ["Crew.create", "Crew.update", "Crew.status", "Crew.export", "Crew.dutyChange", "Crew.assigned", "Crew.released"],
  SparePartUsage: ["SparePartUsage.create", "SparePartUsage.update", "SparePartUsage.status", "SparePartUsage.export", "SparePartUsage.approved", "SparePartUsage.consumed"]
} as const;
