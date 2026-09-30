import type { CrewDto } from "./CrewDtoFactory";
import type { GridAssetDto } from "./GridAssetDtoFactory";
import type { FaultReportDto } from "./FaultReportDtoFactory";
import type { RepairTicketDto } from "./RepairTicketDtoFactory";

/** 派工请求体：必须携带调度员打开候选时看到的乐观锁版本。 */
export interface DispatchRequestPayload {
  ticketId: number;
  crewId: number;
  ticketVersion: number;
  crewVersion: number;
}

export const createDispatchRequest = (body: unknown): DispatchRequestPayload => {
  const payload = (body ?? {}) as Partial<DispatchRequestPayload>;
  return {
    ticketId: Number(payload.ticketId),
    crewId: Number(payload.crewId),
    ticketVersion: Number(payload.ticketVersion),
    crewVersion: Number(payload.crewVersion)
  };
};

export type CandidateRejectReason =
  | "SKILL_NOT_MATCHED"
  | "NOT_ON_DUTY"
  | "CREW_BUSY";

/** 候选班组：匹配成功给出匹配技能；被排除的班组给出排除原因，供调度台说明。 */
export interface CrewCandidateDto extends CrewDto {
  eligible: boolean;
  matched_skills: string[];
  reject_reason: CandidateRejectReason | null;
}

export const createCrewCandidateDto = (
  crew: CrewDto,
  info: {
    eligible: boolean;
    matchedSkills: string[];
    rejectReason: CandidateRejectReason | null;
  }
): CrewCandidateDto => ({
  ...crew,
  eligible: info.eligible,
  matched_skills: info.matchedSkills,
  reject_reason: info.rejectReason
});

/** 派工台工单视图：工单 + 报修单 + 配网资产，派工要同时接好三者。 */
export interface DispatchTicketDto {
  ticket: RepairTicketDto;
  faultReport: FaultReportDto;
  asset: GridAssetDto | null;
}

export const createDispatchTicketDto = (
  ticket: RepairTicketDto,
  faultReport: FaultReportDto,
  asset: GridAssetDto | null
): DispatchTicketDto => ({ ticket, faultReport, asset });

/** GET /dispatch-candidates 响应。 */
export interface DispatchCandidatesDto {
  dispatchTicket: DispatchTicketDto;
  candidates: CrewCandidateDto[];
  calculatedAt: string;
}

export const createDispatchCandidatesDto = (
  dispatchTicket: DispatchTicketDto,
  candidates: CrewCandidateDto[]
): DispatchCandidatesDto => ({
  dispatchTicket,
  candidates,
  calculatedAt: new Date().toISOString()
});

/** POST /dispatch 成功响应。 */
export interface DispatchResultDto {
  dispatchTicket: DispatchTicketDto;
  assignedCrew: CrewDto;
  candidates: CrewCandidateDto[];
  calculatedAt: string;
}

export const createDispatchResultDto = (
  dispatchTicket: DispatchTicketDto,
  assignedCrew: CrewDto,
  candidates: CrewCandidateDto[]
): DispatchResultDto => ({
  dispatchTicket,
  assignedCrew,
  candidates,
  calculatedAt: new Date().toISOString()
});

/** 409 冲突错误 details：落败调度员凭此看到冲突工单并重算候选。 */
export interface DispatchConflictDetail {
  dispatchTicket: DispatchTicketDto;
  candidates: CrewCandidateDto[];
  calculatedAt: string;
}

export const createDispatchConflictDetail = (
  dispatchTicket: DispatchTicketDto,
  candidates: CrewCandidateDto[]
): DispatchConflictDetail => ({
  dispatchTicket,
  candidates,
  calculatedAt: new Date().toISOString()
});
