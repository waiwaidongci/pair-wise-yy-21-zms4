import type { Request, Response } from "express";
import { crewService } from "../services/CrewService";
import { asyncHandler } from "../utils/asyncHandler";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export const crewController = {
  list: (_req: Request, res: Response) => {
    res.json(crewService.list());
  },

  candidates: (req: Request, res: Response) => {
    const ticketId = Number(req.query.ticketId);
    if (!Number.isFinite(ticketId)) {
      res.status(400).json({ code: ERROR_CODES.VALIDATION_FAILED, message: ERROR_MESSAGES.VALIDATION_FAILED });
      return;
    }
    res.json(crewService.candidatesForTicket(ticketId));
  },

  setDutyStatus: asyncHandler((req: Request, res: Response) => {
    const id = Number(req.params.id);
    const dutyStatus = String(req.body?.dutyStatus ?? "");
    if (!Number.isFinite(id) || !dutyStatus) {
      res.status(400).json({ code: ERROR_CODES.VALIDATION_FAILED, message: ERROR_MESSAGES.VALIDATION_FAILED });
      return;
    }
    res.json(crewService.setDutyStatus(id, dutyStatus));
  })
};
