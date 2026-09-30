import { defineStore } from "pinia";
import { listFaultReport } from "../api/FaultReport";
import type { FaultReport } from "../types/FaultReport";

export const useFaultReportStore = defineStore("faultReport", {
  state: () => ({ rows: [] as FaultReport[], loading: false }),
  getters: {
    byId(state) {
      return (id: number) => state.rows.find((report) => report.id === id);
    }
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listFaultReport();
      } finally {
        this.loading = false;
      }
    }
  }
});
