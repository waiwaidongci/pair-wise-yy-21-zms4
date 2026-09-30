import { db } from "../db";
import type { RepairTicket } from "../models/RepairTicket";

export const repairTicketRepository = {
  findAll(): RepairTicket[] {
    return db.repairTickets;
  },
  findById(id: number): RepairTicket | undefined {
    return db.repairTickets.find((ticket) => ticket.id === id);
  },
  update(id: number, patch: Partial<RepairTicket>): RepairTicket | undefined {
    const ticket = this.findById(id);
    if (!ticket) return undefined;
    Object.assign(ticket, patch);
    return ticket;
  }
};
