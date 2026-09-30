import type { DispatchRequestBody } from "../types/Dispatch";

/** 派工请求体构造器：页面/store 不散写 {ticketId, crewId, versions} 结构。 */
export const createDispatchRequestBody = (
  ticketId: number,
  crewId: number,
  ticketVersion: number,
  crewVersion: number
): DispatchRequestBody => ({ ticketId, crewId, ticketVersion, crewVersion });
