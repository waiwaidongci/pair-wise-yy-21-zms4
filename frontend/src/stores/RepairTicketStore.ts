import { defineStore } from "pinia";
import { listRepairTicket } from "../api/RepairTicket";
import type { RepairTicket } from "../types/RepairTicket";
import type { Priority } from "../types/Priority";

/** 与后端 PriorityRank 对齐的候选/待派排序。 */
const PRIORITY_RANK: Record<Priority, number> = { URGENT: 0, HIGH: 1, NORMAL: 2 };

export const useRepairTicketStore = defineStore("repairTicket", {
  state: () => ({ rows: [] as RepairTicket[], loading: false, loadedAt: 0 }),
  getters: {
    waitingTickets(state): RepairTicket[] {
      return state.rows
        .filter((ticket) => ticket.status === "WAIT_DISPATCH")
        .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.id - b.id);
    },
    openTickets(state): RepairTicket[] {
      return state.rows.filter((ticket) =>
        ["ASSIGNED", "ARRIVED", "REPAIRING"].includes(ticket.status)
      );
    },
    byId(state) {
      return (id: number) => state.rows.find((ticket) => ticket.id === id);
    }
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listRepairTicket();
        this.loadedAt = Date.now();
      } finally {
        this.loading = false;
      }
    },
    upsert(row: RepairTicket) {
      const index = this.rows.findIndex((item) => item.id === row.id);
      if (index >= 0) this.rows.splice(index, 1, row);
      else this.rows.push(row);
    }
  }
});
