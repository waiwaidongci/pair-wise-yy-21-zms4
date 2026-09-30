import { crewRepository } from "../repositories/CrewRepository";
import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { faultReportRepository } from "../repositories/FaultReportRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { Crew } from "../models/Crew";

function httpError(status: number, code: string, message: string): never {
  const err = new Error(message) as Error & { status: number; code: string };
  err.status = status;
  err.code = code;
  throw err;
}

export const crewService = {
  list(): Crew[] {
    return crewRepository.findAll();
  },

  findById(id: number): Crew | undefined {
    return crewRepository.findById(id);
  },

  /**
   * 候选班组：技能匹配、当值、且无未结工单。
   * 每次都基于当前状态实时计算——工单或班组状态一旦变化，
   * 之前的候选结果立即失效，需要重新调用本方法。
   */
  candidatesForTicket(ticketId: number): Crew[] {
    const ticket = repairTicketRepository.findById(ticketId);
    if (!ticket) return [];
    const report = faultReportRepository.findById(Number(ticket.fault_report_id));
    const faultType = report?.fault_type;
    if (!faultType) return [];

    return crewRepository.findAll().filter((crew) => {
      if (crew.duty_status !== "ON_DUTY") return false;
      if (crew.current_ticket_id != null) return false;
      const skills = crew.skill_tags.split(",").map((tag) => tag.trim());
      return skills.includes(faultType);
    });
  },

  setDutyStatus(id: number, dutyStatus: string): Crew {
    if (dutyStatus !== "ON_DUTY" && dutyStatus !== "OFF_DUTY") {
      httpError(400, ERROR_CODES.VALIDATION_FAILED, ERROR_MESSAGES.VALIDATION_FAILED);
    }
    const crew = crewRepository.update(id, { duty_status: dutyStatus });
    if (!crew) {
      httpError(404, ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
    }
    console.info(LOG_TEMPLATES.Crew[4], `crew=${id}`, `duty=${dutyStatus}`);
    return { ...crew! };
  }
};
