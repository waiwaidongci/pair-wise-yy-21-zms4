import { request } from "./request";
import type { Crew } from "../types/Crew";

const endpoint = "/api/crew";

export const listCrew = () => request<Crew[]>(endpoint);

/** 候选班组：技能匹配、当值、无未结工单（后端基于当前状态实时计算） */
export const listCandidates = (ticketId: number) =>
  request<Crew[]>(`${endpoint}/candidates?ticketId=${ticketId}`);

export const setCrewDutyStatus = (crewId: number, dutyStatus: string) =>
  request<Crew>(`${endpoint}/${crewId}/duty-status`, { method: "PATCH", body: { dutyStatus } });
