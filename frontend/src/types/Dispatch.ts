import type { Crew } from "./Crew";
import type { FaultReport } from "./FaultReport";
import type { GridAsset } from "./GridAsset";
import type { RepairTicket } from "./RepairTicket";

export type CandidateRejectReason =
  | "SKILL_NOT_MATCHED"
  | "NOT_ON_DUTY"
  | "CREW_BUSY";

export interface CrewCandidate extends Crew {
  eligible: boolean;
  matched_skills: string[];
  reject_reason: CandidateRejectReason | null;
}

export interface DispatchTicketView {
  ticket: RepairTicket;
  faultReport: FaultReport;
  asset: GridAsset | null;
}

export interface DispatchCandidates {
  dispatchTicket: DispatchTicketView;
  candidates: CrewCandidate[];
  calculatedAt: string;
}

export interface DispatchResult extends DispatchCandidates {
  assignedCrew: Crew;
}

export interface DispatchRequestBody {
  ticketId: number;
  crewId: number;
  ticketVersion: number;
  crewVersion: number;
}

export type TicketAction = "ARRIVE" | "REPAIR" | "RESTORE" | "CLOSE";

/** 后端 409 错误体：落败调度员看到冲突工单并据此重算候选。 */
export interface DispatchConflictError {
  code: string;
  message: string;
  details?: DispatchCandidates;
}
