import { defineStore } from "pinia";
import { listSparePartUsage } from "../api/SparePartUsage";
import type { SparePartUsage } from "../types/SparePartUsage";

export const useSparePartUsageStore = defineStore("sparePartUsage", {
  state: () => ({ rows: [] as SparePartUsage[], loading: false }),
  getters: {
    byTicketId(state) {
      return (ticketId: number) => state.rows.filter((row) => row.ticket_id === ticketId);
    }
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listSparePartUsage();
      } finally {
        this.loading = false;
      }
    }
  }
});
