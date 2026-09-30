/**
 * 日志模板集中管理。所有派工台写操作（派工/流转/复电/当值切换）都必须经此取模板，
 * 字段变更时同步调整模板与 service 调用处。
 */
export const LOG_TEMPLATES = {
  GridAsset: ["GridAsset.create", "GridAsset.update", "GridAsset.status", "GridAsset.export"],
  FaultReport: [
    "FaultReport.create",
    "FaultReport.update",
    "FaultReport.status",
    "FaultReport.export"
  ],
  RepairTicket: [
    "RepairTicket.create",
    "RepairTicket.update",
    "RepairTicket.status",
    "RepairTicket.export",
    "RepairTicket.dispatch",
    "RepairTicket.arrive",
    "RepairTicket.repair",
    "RepairTicket.restore",
    "RepairTicket.close"
  ],
  Crew: [
    "Crew.create",
    "Crew.update",
    "Crew.status",
    "Crew.export",
    "Crew.dutySwitch",
    "Crew.occupy",
    "Crew.release"
  ],
  SparePartUsage: [
    "SparePartUsage.create",
    "SparePartUsage.update",
    "SparePartUsage.status",
    "SparePartUsage.export"
  ]
} as const;

export type LogTemplateKey = keyof typeof LOG_TEMPLATES;
