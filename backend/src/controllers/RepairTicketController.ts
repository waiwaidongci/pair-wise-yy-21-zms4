import type { Request, Response } from "express";
import { repairTicketService } from "../services/RepairTicketService";
import { asyncHandler } from "../utils/asyncHandler";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export const repairTicketController = {
  list: (_req: Request, res: Response) => {
    res.json(repairTicketService.list());
  },

  dispatch: asyncHandler(async (req: Request, res: Response) => {
    const ticketId = Number(req.params.id);
    const teamId = Number(req.body?.teamId);
    const dispatcherId = Number((req as Request & { user?: { id: number } }).user?.id ?? 1);
    if (!Number.isFinite(ticketId) || !Number.isFinite(teamId)) {
      res.status(400).json({ code: ERROR_CODES.VALIDATION_FAILED, message: ERROR_MESSAGES.VALIDATION_FAILED });
      return;
    }
    const result = await repairTicketService.dispatch(ticketId, teamId, dispatcherId);
    res.status(200).json(result);
  }),

  transitionStatus: asyncHandler((req: Request, res: Response) => {
    const ticketId = Number(req.params.id);
    const nextStatus = String(req.body?.status ?? "");
    if (!Number.isFinite(ticketId) || !nextStatus) {
      res.status(400).json({ code: ERROR_CODES.VALIDATION_FAILED, message: ERROR_MESSAGES.VALIDATION_FAILED });
      return;
    }
    const result = repairTicketService.transitionStatus(ticketId, nextStatus);
    res.json(result);
  })
};
