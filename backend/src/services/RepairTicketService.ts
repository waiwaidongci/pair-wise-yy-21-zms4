import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { createRepairTicketDto, createRepairTicketDtoList } from "../constructors/RepairTicketDtoFactory";

export const repairTicketService = {
  list: () => createRepairTicketDtoList(repairTicketRepository.findAll()),
  getById: (id: number) => {
    const row = repairTicketRepository.findById(id);
    return row ? createRepairTicketDto(row) : undefined;
  }
};
