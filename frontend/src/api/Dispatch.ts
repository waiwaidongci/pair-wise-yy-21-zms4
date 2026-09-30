import type { DispatchRequestBody, DispatchCandidates, DispatchResult, TicketAction } from "../types/Dispatch";
import type { RepairTicket } from "../types/RepairTicket";
import { requestJson } from "./http";

const endpoint = "/api/repair-ticket";

export interface DispatcherIdentity {
  id: number;
  name: string;
  role: string;
}

export interface DispatchOptions {
  dispatcher: DispatcherIdentity;
  simulateWriteFailure?: "afterTicket" | "afterCrew";
}

/** 拉取某张待派工单的候选班组（结果随工单/班组状态变化实时重算）。 */
export const fetchDispatchCandidates = (ticketId: number): Promise<DispatchCandidates> =>
  requestJson<DispatchCandidates>(`${endpoint}/${ticketId}/dispatch-candidates`);

/** 派工保存；409 时 ApiError.details 携带冲突工单与重算候选。 */
export const saveDispatch = (
  body: DispatchRequestBody,
  options: DispatchOptions
): Promise<DispatchResult> =>
  requestJson<DispatchResult>(`${endpoint}/${body.ticketId}/dispatch`, {
    method: "POST",
    body,
    dispatcher: options.dispatcher,
    simulateWriteFailure: options.simulateWriteFailure
  });

/** 到场/抢修/复电/归档。 */
export const saveTicketTransition = (
  ticketId: number,
  version: number,
  action: TicketAction,
  dispatcher: DispatcherIdentity
): Promise<RepairTicket> =>
  requestJson<RepairTicket>(`${endpoint}/${ticketId}/transition`, {
    method: "POST",
    body: { ticketId, version, action },
    dispatcher
  });
