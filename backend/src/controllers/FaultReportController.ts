import type { Request, Response } from "express";
import { faultReportService } from "../services/FaultReportService";
import { asyncHandler } from "../utils/controllerUtils";
import { BusinessError } from "../utils/errors";
import { ERROR_CODES } from "../constants/errorCodes";

export const faultReportController = {
  list: asyncHandler((_req: Request, res: Response) => {
    res.json(faultReportService.list());
  }),
  detail: asyncHandler((req: Request, res: Response) => {
    const row = faultReportService.getById(Number(req.params.id));
    if (!row) throw BusinessError.notFound(ERROR_CODES.FAULT_REPORT_NOT_FOUND, req.params.id);
    res.json(row);
  })
};
