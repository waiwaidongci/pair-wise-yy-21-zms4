import type { Request, Response } from "express";
import { sparePartUsageService } from "../services/SparePartUsageService";
import { asyncHandler } from "../utils/controllerUtils";

export const sparePartUsageController = {
  list: asyncHandler((_req: Request, res: Response) => {
    res.json(sparePartUsageService.list());
  }),
  listByTicket: asyncHandler((req: Request, res: Response) => {
    res.json(sparePartUsageService.listByTicket(Number(req.params.ticketId)));
  })
};
