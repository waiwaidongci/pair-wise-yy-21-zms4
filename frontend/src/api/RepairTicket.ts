import { request } from "./request";
import type { RepairTicket, DispatchResult } from "../types/RepairTicket";

const endpoint = "/api/repair-ticket";

export const listRepairTicket = () => request<RepairTicket[]>(endpoint);

export const dispatchTicket = (ticketId: number, teamId: number) =>
  request<DispatchResult>(`${endpoint}/${ticketId}/dispatch`, { method: "POST", body: { teamId } });

export const transitionTicketStatus = (ticketId: number, status: string) =>
  request<RepairTicket>(`${endpoint}/${ticketId}/status`, { method: "PATCH", body: { status } });
