import type { Request, Response } from "express";
import { repairTicketService } from "../services/RepairTicketService";
import { asyncHandler } from "../utils/controllerUtils";
import { BusinessError } from "../utils/errors";
import { ERROR_CODES } from "../constants/errorCodes";

export const repairTicketController = {
  list: asyncHandler((_req: Request, res: Response) => {
    res.json(repairTicketService.list());
  }),
  detail: asyncHandler((req: Request, res: Response) => {
    const row = repairTicketService.getById(Number(req.params.id));
    if (!row) throw BusinessError.notFound(ERROR_CODES.TICKET_NOT_FOUND, req.params.id);
    res.json(row);
  })
};
