import type { Request, Response } from "express";
import { dispatchService, type SimulateWriteFailure } from "../services/DispatchService";
import { createDispatchRequest } from "../constructors/DispatchDtoFactory";
import { asyncHandler } from "../utils/controllerUtils";
import { BusinessError } from "../utils/errors";
import { ERROR_CODES } from "../constants/errorCodes";
import type { AuditActor } from "../utils/auditLogger";
import type { RepairTicketTransitionPayload } from "../types/RepairTicketPayload";
import type { CrewDutyPayload } from "../types/CrewPayload";
import { DutyStatus } from "../constants/DutyStatus";

const actorOf = (req: Request): AuditActor =>
  ((req as unknown as { user: AuditActor }).user ?? { id: 0, role: "anonymous" }) as AuditActor;

const isPositive = (value: number) => Number.isInteger(value) && value > 0;

const simulateOf = (req: Request): SimulateWriteFailure => {
  const raw = req.header("x-simulate-write-failure");
  return raw === "afterTicket" || raw === "afterCrew" ? raw : "none";
};

export const dispatchController = {
  /** 待派工单的候选班组（技能匹配 + 当值 + 无未结工单）。 */
  candidates: asyncHandler((req: Request, res: Response) => {
    const ticketId = Number(req.params.ticketId);
    if (!isPositive(ticketId)) {
      throw new BusinessError(ERROR_CODES.VALIDATION_FAILED, { field: "ticketId" });
    }
    res.json(dispatchService.listCandidates(ticketId));
  }),

  /** 派工保存：乐观锁并发控制，失败返回 409 + 冲突工单 + 重算候选。 */
  dispatch: asyncHandler(async (req: Request, res: Response) => {
    const payload = createDispatchRequest(req.body);
    if (
      !isPositive(payload.ticketId) ||
      !isPositive(payload.crewId) ||
      !Number.isInteger(payload.ticketVersion) ||
      !Number.isInteger(payload.crewVersion)
    ) {
      throw new BusinessError(ERROR_CODES.VALIDATION_FAILED, {
        fields: "ticketId,crewId,ticketVersion,crewVersion"
      });
    }
    const result = await dispatchService.dispatch(payload, actorOf(req), simulateOf(req));
    res.status(201).json(result);
  }),

  /** 到场/抢修/复电/归档。 */
  transition: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as Partial<RepairTicketTransitionPayload>;
    const ticketId = Number(req.params.ticketId);
    const action = body?.action;
    const version = Number(body?.version);
    if (
      !isPositive(ticketId) ||
      !Number.isInteger(version) ||
      !["ARRIVE", "REPAIR", "RESTORE", "CLOSE"].includes(action ?? "")
    ) {
      throw new BusinessError(ERROR_CODES.VALIDATION_FAILED, {
        fields: "ticketId,version,action"
      });
    }
    const dto = await dispatchService.transition(
      ticketId,
      version,
      action as RepairTicketTransitionPayload["action"],
      actorOf(req)
    );
    res.json(dto);
  }),

  /** 班组当值切换。 */
  crewDuty: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as Partial<CrewDutyPayload>;
    const crewId = Number(req.params.crewId);
    const version = Number(body?.version);
    const dutyStatus = body?.dutyStatus;
    if (
      !isPositive(crewId) ||
      !Number.isInteger(version) ||
      !(DutyStatus as readonly string[]).includes(dutyStatus ?? "")
    ) {
      throw new BusinessError(ERROR_CODES.VALIDATION_FAILED, { fields: "crewId,version,dutyStatus" });
    }
    res.json(
      await dispatchService.switchCrewDuty(
        crewId,
        version,
        dutyStatus as CrewDutyPayload["dutyStatus"],
        actorOf(req)
      )
    );
  })
};
