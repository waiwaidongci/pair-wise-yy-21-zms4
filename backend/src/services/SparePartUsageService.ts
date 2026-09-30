import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import { createSparePartUsageDtoList } from "../constructors/SparePartUsageDtoFactory";

export const sparePartUsageService = {
  list: () => createSparePartUsageDtoList(sparePartUsageRepository.findAll()),
  listByTicket: (ticketId: number) =>
    createSparePartUsageDtoList(sparePartUsageRepository.findByTicketId(ticketId))
};
