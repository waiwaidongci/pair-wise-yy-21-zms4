import type { Request, Response } from "express";
import { crewService } from "../services/CrewService";
import { asyncHandler } from "../utils/controllerUtils";
import { BusinessError } from "../utils/errors";
import { ERROR_CODES } from "../constants/errorCodes";

export const crewController = {
  list: asyncHandler((_req: Request, res: Response) => {
    res.json(crewService.list());
  }),
  detail: asyncHandler((req: Request, res: Response) => {
    const row = crewService.getById(Number(req.params.id));
    if (!row) throw BusinessError.notFound(ERROR_CODES.CREW_NOT_FOUND, req.params.id);
    res.json(row);
  })
};
