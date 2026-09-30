import { faultReportRepository } from "../repositories/FaultReportRepository";
import { createFaultReportDto, createFaultReportDtoList } from "../constructors/FaultReportDtoFactory";

export const faultReportService = {
  list: () => createFaultReportDtoList(faultReportRepository.findAll()),
  getById: (id: number) => {
    const row = faultReportRepository.findById(id);
    return row ? createFaultReportDto(row) : undefined;
  }
};
