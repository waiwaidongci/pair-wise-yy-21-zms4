import { defineStore } from "pinia";
import { listCrew } from "../api/Crew";
import type { Crew } from "../types/Crew";

export const useCrewStore = defineStore("crew", {
  state: () => ({ rows: [] as Crew[], loading: false, loadedAt: 0 }),
  getters: {
    onDutyCrews(state): Crew[] {
      return state.rows.filter((crew) => crew.duty_status === "ON_DUTY");
    },
    freeCrews(state): Crew[] {
      return state.rows.filter(
        (crew) => crew.duty_status === "ON_DUTY" && crew.current_ticket_id === null
      );
    },
    byId(state) {
      return (id: number) => state.rows.find((crew) => crew.id === id);
    }
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listCrew();
        this.loadedAt = Date.now();
      } finally {
        this.loading = false;
      }
    },
    upsert(row: Crew) {
      const index = this.rows.findIndex((item) => item.id === row.id);
      if (index >= 0) this.rows.splice(index, 1, row);
      else this.rows.push(row);
    }
  }
});
