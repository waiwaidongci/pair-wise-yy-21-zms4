import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { crewRepository } from "../repositories/CrewRepository";
import { faultReportRepository } from "../repositories/FaultReportRepository";
import { gridAssetRepository } from "../repositories/GridAssetRepository";
import {
  createCrewDto,
  type CrewDto
} from "../constructors/CrewDtoFactory";
import {
  createCrewCandidateDto,
  type CrewCandidateDto,
  type CandidateRejectReason
} from "../constructors/DispatchDtoFactory";
import { FaultTypeSkillMap, parseSkillTags } from "../constants/SkillTag";
import { isOpenTicketStatus } from "../constants/TicketStatus";
import type { VersionedRepairTicket } from "../models/RepairTicket";

/**
 * 派工候选计算（纯领域逻辑）：
 * 同时满足 技能匹配 + 当值(ON_DUTY) + 无未结工单 的班组才 eligible。
 * 任何工单或班组状态变化后都会重新计算，不做跨请求缓存。
 */
export const matchCandidates = (faultType: string): CrewCandidateDto[] => {
  const requiredSkills = FaultTypeSkillMap[faultType] ?? [];
  return crewRepository.findAll().map((crewRow) => {
    const dto: CrewDto = createCrewDto(crewRow);
    const tags = parseSkillTags(crewRow.skill_tags);
    const matched = requiredSkills.filter((skill) => tags.includes(skill));

    let rejectReason: CandidateRejectReason | null = null;
    if (crewRow.duty_status !== "ON_DUTY") {
      rejectReason = "NOT_ON_DUTY";
    } else if (crewRow.current_ticket_id != null) {
      rejectReason = "CREW_BUSY";
    } else if (matched.length === 0) {
      rejectReason = "SKILL_NOT_MATCHED";
    }

    return createCrewCandidateDto(dto, {
      eligible: rejectReason === null,
      matchedSkills: matched,
      rejectReason
    });
  });
};

/** 工单视角的“班组是否还被未结工单占用”，供提交时二次校验。 */
export const crewHasOpenTicket = (crewId: number, ignoreTicketId?: number): boolean =>
  repairTicketRepository
    .findAll()
    .some(
      (ticket) =>
        ticket.team_id === crewId &&
        ticket.id !== ignoreTicketId &&
        isOpenTicketStatus(ticket.status)
    );

/** 拼装某张工单关联的 报修单/资产，候选与冲突响应用同一份口径。 */
export const loadDispatchTicketView = (ticket: VersionedRepairTicket) => {
  const faultReport = faultReportRepository.findById(ticket.fault_report_id);
  const asset = faultReport ? gridAssetRepository.findById(faultReport.asset_id) : undefined;
  return { faultReport, asset };
};
