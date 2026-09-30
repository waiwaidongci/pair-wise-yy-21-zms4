import { gridAssetRepository } from "../repositories/GridAssetRepository";
import { createGridAssetDto, createGridAssetDtoList } from "../constructors/GridAssetDtoFactory";

export const gridAssetService = {
  list: () => createGridAssetDtoList(gridAssetRepository.findAll()),
  getById: (id: number) => {
    const row = gridAssetRepository.findById(id);
    return row ? createGridAssetDto(row) : undefined;
  }
};
