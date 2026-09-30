import type { RepairTicket } from "../types/RepairTicket";

export const createDefaultRepairTicket = (overrides: Partial<RepairTicket> = {}): RepairTicket => ({
  id: 0,
  fault_report_id: 0,
  team_id: null,
  dispatcher_id: null,
  priority: "NORMAL",
  status: "WAIT_DISPATCH",
  assigned_at: null,
  restored_at: null,
  version: 1,
  ...overrides
});

export const createRepairTicketForm = createDefaultRepairTicket;
export const createRepairTicketResponse = createDefaultRepairTicket;
