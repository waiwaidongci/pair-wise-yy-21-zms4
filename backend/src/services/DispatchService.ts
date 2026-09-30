import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { crewRepository } from "../repositories/CrewRepository";
import { gridAssetRepository } from "../repositories/GridAssetRepository";
import { faultReportRepository } from "../repositories/FaultReportRepository";
import {
  createMutationScope,
  rollbackScope
} from "../repositories/store";
import { runExclusive } from "../utils/writeLock";
import { BusinessError } from "../utils/errors";
import { ERROR_CODES } from "../constants/errorCodes";
import {
  FaultTypeSkillMap,
  parseSkillTags
} from "../constants/SkillTag";
import {
  TicketStatusFlow,
  type TicketStatus
} from "../constants/TicketStatus";
import type { DispatchRequestPayload } from "../constructors/DispatchDtoFactory";
import {
  createDispatchCandidatesDto,
  createDispatchConflictDetail,
  createDispatchResultDto,
  createDispatchTicketDto,
  type DispatchCandidatesDto,
  type DispatchResultDto
} from "../constructors/DispatchDtoFactory";
import {
  createRepairTicketDto
} from "../constructors/RepairTicketDtoFactory";
import {
  createCrewDto
} from "../constructors/CrewDtoFactory";
import {
  createFaultReportDto
} from "../constructors/FaultReportDtoFactory";
import {
  createGridAssetDto
} from "../constructors/GridAssetDtoFactory";
import { crewHasOpenTicket, loadDispatchTicketView, matchCandidates } from "./dispatchCandidateService";
import { auditLogger, type AuditActor } from "../utils/auditLogger";

/** 联调/测试用：请求头 x-simulate-write-failure 注入三实体写入中途失败。 */
export type SimulateWriteFailure = "none" | "afterTicket" | "afterCrew";

const buildCandidatesForTicket = (ticketId: number): DispatchCandidatesDto => {
  const ticket = repairTicketRepository.findById(ticketId);
  if (!ticket) throw BusinessError.notFound(ERROR_CODES.TICKET_NOT_FOUND, ticketId);
  const { faultReport, asset } = loadDispatchTicketView(ticket);
  if (!faultReport) {
    throw BusinessError.notFound(ERROR_CODES.FAULT_REPORT_NOT_FOUND, ticket.fault_report_id);
  }
  const candidates = matchCandidates(faultReport.fault_type);
  return createDispatchCandidatesDto(
    createDispatchTicketDto(
      createRepairTicketDto(ticket),
      createFaultReportDto(faultReport),
      asset ? createGridAssetDto(asset) : null
    ),
    candidates
  );
};

export const dispatchService = {
  /** 计算候选：待派工单 + 满足三条件的抢修班组。 */
  listCandidates(ticketId: number): DispatchCandidatesDto {
    const bundle = buildCandidatesForTicket(ticketId);
    if (bundle.dispatchTicket.ticket.status !== "WAIT_DISPATCH") {
      throw new BusinessError(
        ERROR_CODES.DISPATCH_STATUS_CHANGED,
        { id: ticketId, status: bundle.dispatchTicket.ticket.status },
        409,
        { candidates: bundle.candidates, dispatchTicket: bundle.dispatchTicket, calculatedAt: bundle.calculatedAt }
      );
    }
    return bundle;
  },

  /**
   * 派工保存（原子）：
   * 1. 写锁串行化两位调度员的并发保存；
   * 2. 乐观锁比对工单/班组版本，落败方拿到 409 + 冲突工单 + 重算候选；
   * 3. 重新校验 技能匹配/当值/无未结工单；
   * 4. 工单、班组、资产（+报修单状态）同事务写入，任一失败整体回滚。
   */
  async dispatch(
    payload: DispatchRequestPayload,
    actor: AuditActor,
    simulate: SimulateWriteFailure = "none"
  ): Promise<DispatchResultDto> {
    return runExclusive(async () => {
      const scope = createMutationScope();
      try {
        const ticket = repairTicketRepository.findById(payload.ticketId);
        if (!ticket) throw BusinessError.notFound(ERROR_CODES.TICKET_NOT_FOUND, payload.ticketId);
        const crew = crewRepository.findById(payload.crewId);
        if (!crew) throw BusinessError.notFound(ERROR_CODES.CREW_NOT_FOUND, payload.crewId);
        const { faultReport, asset } = loadDispatchTicketView(ticket);
        if (!faultReport) {
          throw BusinessError.notFound(ERROR_CODES.FAULT_REPORT_NOT_FOUND, ticket.fault_report_id);
        }

        // —— 乐观锁：工单或班组版本被其他调度员推进即落败 ——
        if (ticket.version !== payload.ticketVersion) {
          throw BusinessError.conflict(
            ERROR_CODES.DISPATCH_VERSION_CONFLICT,
            { id: ticket.id, expected: payload.ticketVersion, actual: ticket.version },
            createDispatchConflictDetail(
              createDispatchTicketDto(
                createRepairTicketDto(ticket),
                createFaultReportDto(faultReport),
                asset ? createGridAssetDto(asset) : null
              ),
              matchCandidates(faultReport.fault_type)
            )
          );
        }
        if (crew.version !== payload.crewVersion) {
          throw BusinessError.conflict(
            ERROR_CODES.DISPATCH_VERSION_CONFLICT,
            { id: ticket.id, expected: payload.crewVersion, actual: crew.version },
            createDispatchConflictDetail(
              createDispatchTicketDto(
                createRepairTicketDto(ticket),
                createFaultReportDto(faultReport),
                asset ? createGridAssetDto(asset) : null
              ),
              matchCandidates(faultReport.fault_type)
            )
          );
        }

        // —— 工单状态可能已被另一笔派工改变 ——
        if (ticket.status !== "WAIT_DISPATCH") {
          throw BusinessError.conflict(
            ERROR_CODES.DISPATCH_STATUS_CHANGED,
            { id: ticket.id, status: ticket.status },
            createDispatchConflictDetail(
              createDispatchTicketDto(
                createRepairTicketDto(ticket),
                createFaultReportDto(faultReport),
                asset ? createGridAssetDto(asset) : null
              ),
              matchCandidates(faultReport.fault_type)
            )
          );
        }

        // —— 提交瞬间重算候选三条件 ——
        const requiredSkills = FaultTypeSkillMap[faultReport.fault_type] ?? [];
        const tags = parseSkillTags(crew.skill_tags);
        if (!requiredSkills.some((skill) => tags.includes(skill))) {
          throw new BusinessError(ERROR_CODES.SKILL_NOT_MATCHED, {
            id: crew.id,
            skills: requiredSkills.join(",")
          });
        }
        if (crew.duty_status !== "ON_DUTY") {
          throw new BusinessError(ERROR_CODES.CREW_NOT_ON_DUTY, {
            id: crew.id,
            status: crew.duty_status
          });
        }
        if (crew.current_ticket_id != null || crewHasOpenTicket(crew.id, ticket.id)) {
          throw new BusinessError(ERROR_CODES.CREW_BUSY, {
            id: crew.id,
            ticketId: crew.current_ticket_id ?? "?"
          });
        }

        const now = new Date().toISOString();

        // 第 1 写：工单 -> ASSIGNED，占用班组
        const ticketWrite = repairTicketRepository.compareAndSet(ticket.id, payload.ticketVersion, {
          team_id: crew.id,
          dispatcher_id: actor.id,
          status: "ASSIGNED",
          assigned_at: now
        });
        if (ticketWrite.result !== "OK" || !ticketWrite.current) {
          // 锁内理论上不会发生；仍按冲突处理，交给上层返回重算候选。
          throw BusinessError.conflict(
            ERROR_CODES.DISPATCH_VERSION_CONFLICT,
            { id: ticket.id, expected: payload.ticketVersion, actual: ticket.version },
            createDispatchConflictDetail(
              createDispatchTicketDto(
                createRepairTicketDto(ticket),
                createFaultReportDto(faultReport),
                asset ? createGridAssetDto(asset) : null
              ),
              matchCandidates(faultReport.fault_type)
            )
          );
        }
        if (simulate === "afterTicket") {
          throw new Error("simulated write failure after ticket updated");
        }

        // 第 2 写：班组 current_ticket_id 指向该工单
        const crewWrite = crewRepository.compareAndSet(crew.id, payload.crewVersion, {
          current_ticket_id: ticket.id
        });
        if (crewWrite.result !== "OK") {
          throw BusinessError.conflict(
            ERROR_CODES.DISPATCH_VERSION_CONFLICT,
            { id: ticket.id, expected: payload.crewVersion, actual: crew.version },
            createDispatchConflictDetail(
              createDispatchTicketDto(
                createRepairTicketDto(ticket),
                createFaultReportDto(faultReport),
                asset ? createGridAssetDto(asset) : null
              ),
              matchCandidates(faultReport.fault_type)
            )
          );
        }
        if (simulate === "afterCrew") {
          throw new Error("simulated write failure after crew occupied");
        }

        // 第 3 写：配网资产接入抢修链路（健康状态联动），报修单同步处理中
        if (asset) {
          gridAssetRepository.updateHealthStatus(
            asset.id,
            asset.health_status === "DANGEROUS" ? "DANGEROUS" : "DEGRADED"
          );
        }
        faultReportRepository.updateStatus(faultReport.id, "PROCESSING");

        auditLogger.ticketDispatch(actor, ticket.id, {
          crewId: crew.id,
          assetId: asset ? asset.id : null,
          faultReportId: faultReport.id
        });
        auditLogger.crewOccupy(actor, crew.id, ticket.id);

        const refreshed = buildCandidatesForTicket(ticket.id);
        return createDispatchResultDto(
          refreshed.dispatchTicket,
          createCrewDto(crewRepository.findById(crew.id)!),
          refreshed.candidates
        );
      } catch (err) {
        // 任何写入失败（含注入故障）：恢复工单/班组/资产/报修单原状态，
        // 绝不允许“班组已占用、工单却未派出”。
        rollbackScope(scope);
        if (err instanceof BusinessError) throw err;
        throw new BusinessError(ERROR_CODES.DISPATCH_WRITE_FAILED, {}, 500);
      }
    });
  },

  /**
   * 工单状态流转（到场/抢修/复电/归档），同样三实体联动并支持回滚：
   * 复电时班组释放、资产健康回落、restored_at 落值。
   */
  async transition(
    ticketId: number,
    expectedVersion: number,
    action: "ARRIVE" | "REPAIR" | "RESTORE" | "CLOSE",
    actor: AuditActor
  ) {
    return runExclusive(async () => {
      const scope = createMutationScope();
      try {
        const ticket = repairTicketRepository.findById(ticketId);
        if (!ticket) throw BusinessError.notFound(ERROR_CODES.TICKET_NOT_FOUND, ticketId);
        if (ticket.version !== expectedVersion) {
          throw BusinessError.conflict(
            ERROR_CODES.DISPATCH_VERSION_CONFLICT,
            { id: ticketId, expected: expectedVersion, actual: ticket.version },
            createDispatchConflictDetail(
              createDispatchTicketDto(
                createRepairTicketDto(ticket),
                createFaultReportDto(
                  faultReportRepository.findById(ticket.fault_report_id)!
                ),
                (() => {
                  const view = loadDispatchTicketView(ticket);
                  return view.asset ? createGridAssetDto(view.asset) : null;
                })()
              ),
              (() => {
                const fr = faultReportRepository.findById(ticket.fault_report_id);
                return fr ? matchCandidates(fr.fault_type) : [];
              })()
            )
          );
        }

        const actionToStatus: Record<typeof action, TicketStatus> = {
          ARRIVE: "ARRIVED",
          REPAIR: "REPAIRING",
          RESTORE: "RESTORED",
          CLOSE: "CLOSED"
        };
        const target = actionToStatus[action];
        if (TicketStatusFlow[ticket.status] !== target) {
          throw new BusinessError(ERROR_CODES.ILLEGAL_TICKET_TRANSITION, {
            id: ticketId,
            from: ticket.status,
            to: target,
            allowed: TicketStatusFlow[ticket.status] ?? "none"
          });
        }

        const now = new Date().toISOString();
        const updated = repairTicketRepository.updateStatus(ticketId, {
          status: target,
          restored_at: target === "RESTORED" ? now : ticket.restored_at
        });
        if (!updated) throw BusinessError.notFound(ERROR_CODES.TICKET_NOT_FOUND, ticketId);

        const { faultReport, asset } = loadDispatchTicketView(updated);

        if (target === "RESTORED") {
          // 复电：释放班组、资产回落到 WATCH、报修单关闭
          if (updated.team_id != null) {
            const crew = crewRepository.findById(updated.team_id);
            if (crew && crew.current_ticket_id === ticketId) {
              crewRepository.compareAndSet(crew.id, crew.version, { current_ticket_id: null });
              auditLogger.crewRelease(actor, crew.id, ticketId);
            }
          }
          if (asset) gridAssetRepository.updateHealthStatus(asset.id, "WATCH");
          if (faultReport) faultReportRepository.updateStatus(faultReport.id, "RESTORED");
        }

        const templateByStatus: Partial<Record<TicketStatus, string>> = {
          ARRIVED: "RepairTicket.arrive",
          REPAIRING: "RepairTicket.repair",
          RESTORED: "RepairTicket.restore",
          CLOSED: "RepairTicket.close"
        };
        auditLogger.ticketTransition(
          actor,
          (templateByStatus[target] ?? "RepairTicket.status") as never,
          ticketId,
          `ticket=${ticketId} ${ticket.status} -> ${target}`
        );

        return createRepairTicketDto(repairTicketRepository.findById(ticketId)!);
      } catch (err) {
        rollbackScope(scope);
        if (err instanceof BusinessError) throw err;
        throw new BusinessError(ERROR_CODES.DISPATCH_WRITE_FAILED, {}, 500);
      }
    });
  },

  /** 班组当值切换：版本自增，其他调度员持有的旧候选随即失效。 */
  switchCrewDuty(crewId: number, expectedVersion: number, dutyStatus: "ON_DUTY" | "OFF_DUTY", actor: AuditActor) {
    return runExclusive(() => {
      const crew = crewRepository.findById(crewId);
      if (!crew) throw BusinessError.notFound(ERROR_CODES.CREW_NOT_FOUND, crewId);
      if (crew.version !== expectedVersion) {
        throw BusinessError.conflict(ERROR_CODES.DISPATCH_VERSION_CONFLICT, {
          id: crewId,
          expected: expectedVersion,
          actual: crew.version
        });
      }
      if (dutyStatus === "OFF_DUTY" && crew.current_ticket_id != null) {
        throw new BusinessError(ERROR_CODES.CREW_BUSY, {
          id: crewId,
          ticketId: crew.current_ticket_id
        });
      }
      const updated = crewRepository.updateDutyStatus(crewId, dutyStatus);
      auditLogger.crewDutySwitch(
        actor,
        crewId,
        `crew=${crewId} duty ${crew.duty_status} -> ${dutyStatus}`
      );
      return createCrewDto(updated!);
    });
  }
};

export const { listCandidates } = dispatchService;
