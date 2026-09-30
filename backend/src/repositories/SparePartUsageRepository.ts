import { getState } from "./store";
import type { SparePartUsage } from "../models/SparePartUsage";

export const sparePartUsageRepository = {
  findAll: (): SparePartUsage[] => getState().sparePartUsage.map((row) => ({ ...row })),
  findByTicketId: (ticketId: number): SparePartUsage[] =>
    getState().sparePartUsage.filter((row) => row.ticket_id === ticketId).map((row) => ({ ...row })),
  save: (row: SparePartUsage): SparePartUsage => row
};
