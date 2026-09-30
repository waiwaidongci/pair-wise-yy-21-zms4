import type { Request, Response } from "express";
import { gridAssetService } from "../services/GridAssetService";
import { asyncHandler } from "../utils/controllerUtils";
import { BusinessError } from "../utils/errors";
import { ERROR_CODES } from "../constants/errorCodes";

export const gridAssetController = {
  list: asyncHandler((_req: Request, res: Response) => {
    res.json(gridAssetService.list());
  }),
  detail: asyncHandler((req: Request, res: Response) => {
    const row = gridAssetService.getById(Number(req.params.id));
    if (!row) throw BusinessError.notFound(ERROR_CODES.ASSET_NOT_FOUND, req.params.id);
    res.json(row);
  })
};
