import { withLock, withTransaction } from "../db";
import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { crewRepository } from "../repositories/CrewRepository";
import { faultReportRepository } from "../repositories/FaultReportRepository";
import { gridAssetRepository } from "../repositories/GridAssetRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { RepairTicket } from "../models/RepairTicket";
import type { Crew } from "../models/Crew";
import type { GridAsset } from "../models/GridAsset";

export interface DispatchResult {
  ticket: RepairTicket;
  crew: Crew;
  asset: GridAsset;
}

function httpError(status: number, code: string, message: string, extra: Record<string, unknown> = {}): never {
  const err = new Error(message) as Error & { status: number; code: string };
  err.status = status;
  err.code = code;
  Object.assign(err, extra);
  throw err;
}

/** 工单状态 -> 允许的下一状态 */
const NEXT_STATUSES: Record<string, string[]> = {
  WAIT_DISPATCH: ["ASSIGNED"],
  ASSIGNED: ["ARRIVED"],
  ARRIVED: ["REPAIRING"],
  REPAIRING: ["RESTORED"],
  RESTORED: ["CLOSED"],
  CLOSED: []
};

export const repairTicketService = {
  list(): RepairTicket[] {
    return repairTicketRepository.findAll();
  },

  findById(id: number): RepairTicket | undefined {
    return repairTicketRepository.findById(id);
  },

  /**
   * 派工：同时接好抢修工单、抢修班组、配网资产（并回写故障报修）。
   * - 按工单加互斥锁，两位调度员同时保存时只允许一笔成立；
   * - 落败方收到 409 与当前冲突工单，前端据此重新计算候选；
   * - 整体包在事务里，任何一步写入失败都恢复原状态，
   *   不会出现“班组已占用但工单未派”的中间态。
   */
  async dispatch(ticketId: number, teamId: number, dispatcherId: number): Promise<DispatchResult> {
    return withLock(`ticket:${ticketId}`, () =>
      withTransaction(() => {
        const ticket = repairTicketRepository.findById(ticketId);
        if (!ticket) {
          httpError(404, ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
        }

        if (ticket!.status !== "WAIT_DISPATCH") {
          console.info(LOG_TEMPLATES.RepairTicket[5], `ticket=${ticketId}`, `status=${ticket!.status}`);
          httpError(409, ERROR_CODES.TICKET_ALREADY_DISPATCHED, ERROR_MESSAGES.TICKET_ALREADY_DISPATCHED, {
            ticket: { ...ticket! }
          });
        }

        const crew = crewRepository.findById(teamId);
        if (!crew) {
          httpError(404, ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
        }

        const report = faultReportRepository.findById(Number(ticket!.fault_report_id));
        const faultType = report?.fault_type;

        if (crew!.duty_status !== "ON_DUTY") {
          httpError(409, ERROR_CODES.CREW_NOT_ON_DUTY, ERROR_MESSAGES.CREW_NOT_ON_DUTY, {
            ticket: { ...ticket! },
            crew: { ...crew! }
          });
        }
        if (crew!.current_ticket_id != null) {
          httpError(409, ERROR_CODES.CREW_HAS_OPEN_TICKET, ERROR_MESSAGES.CREW_HAS_OPEN_TICKET, {
            ticket: { ...ticket! },
            crew: { ...crew! }
          });
        }
        const skills = crew!.skill_tags.split(",").map((tag) => tag.trim());
        if (!faultType || !skills.includes(faultType)) {
          httpError(409, ERROR_CODES.CREW_SKILL_MISMATCH, ERROR_MESSAGES.CREW_SKILL_MISMATCH, {
            ticket: { ...ticket! },
            crew: { ...crew! },
            requiredSkill: faultType
          });
        }

        // 写入顺序：工单 -> 班组 -> 资产。资产写入若失败，前两步一并回滚。
        const now = new Date().toISOString();
        ticket!.team_id = crew!.id;
        ticket!.dispatcher_id = dispatcherId;
        ticket!.status = "ASSIGNED";
        ticket!.assigned_at = now;

        crew!.current_ticket_id = ticket!.id;

        const asset = gridAssetRepository.findById(Number(report!.asset_id));
        if (!asset) {
          // 资产缺失属于写入失败：回滚工单与班组，恢复到派工前状态。
          httpError(409, ERROR_CODES.ASSET_NOT_FOUND, ERROR_MESSAGES.ASSET_NOT_FOUND);
        }
        asset!.owner_team_id = crew!.id;

        if (report) {
          report.status = "DISPATCHED";
        }

        console.info(LOG_TEMPLATES.RepairTicket[4], `ticket=${ticketId}`, `crew=${crew!.id}`, `dispatcher=${dispatcherId}`);
        return { ticket: { ...ticket! }, crew: { ...crew! }, asset: { ...asset! } };
      })
    );
  },

  /** 工单状态流转；复电/结案时释放班组，候选随之失效重算。 */
  transitionStatus(ticketId: number, nextStatus: string): RepairTicket {
    const ticket = repairTicketRepository.findById(ticketId);
    if (!ticket) {
      httpError(404, ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
    }
    const allowed = NEXT_STATUSES[ticket!.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      httpError(409, ERROR_CODES.INVALID_STATUS_TRANSITION, ERROR_MESSAGES.INVALID_STATUS_TRANSITION, {
        ticket: { ...ticket! }
      });
    }

    ticket!.status = nextStatus;
    if (nextStatus === "RESTORED") {
      ticket!.restored_at = new Date().toISOString();
    }
    if (nextStatus === "RESTORED" || nextStatus === "CLOSED") {
      const crew = crewRepository.findById(Number(ticket!.team_id));
      if (crew && crew.current_ticket_id === ticket!.id) {
        crew.current_ticket_id = null;
        console.info(LOG_TEMPLATES.Crew[6], `crew=${crew.id}`, `ticket=${ticket!.id}`);
      }
    }

    console.info(LOG_TEMPLATES.RepairTicket[6], `ticket=${ticketId}`, `from=${ticket!.status}`, `to=${nextStatus}`);
    return { ...ticket! };
  }
};
