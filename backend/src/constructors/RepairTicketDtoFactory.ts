import type { RepairTicket } from "../models/RepairTicket";

export const createRepairTicketDto = (overrides: Partial<RepairTicket> = {}): RepairTicket => ({
  id: 0,
  fault_report_id: 0,
  team_id: null,
  dispatcher_id: null,
  priority: "NORMAL",
  status: "WAIT_DISPATCH",
  assigned_at: null,
  restored_at: null,
  ...overrides
});

/** 派工请求 DTO */
export const createDispatchDto = (teamId: number, dispatcherId: number) => ({
  teamId,
  dispatcherId
});

/** 派工响应 DTO：同时回传工单、班组、配网资产 */
export const createDispatchResponseDto = (ticket: RepairTicket, crew: unknown, asset: unknown) => ({
  ticket,
  crew,
  asset
});

export const createRepairTicketForm = createRepairTicketDto;
export const createRepairTicketResponse = createRepairTicketDto;
