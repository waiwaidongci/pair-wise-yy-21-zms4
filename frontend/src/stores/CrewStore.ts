import { defineStore } from "pinia";
import { listCrew, setCrewDutyStatus } from "../api/Crew";
import type { Crew } from "../types/Crew";

interface State {
  rows: Crew[];
  loading: boolean;
}

export const useCrewStore = defineStore("crew", {
  state: (): State => ({ rows: [], loading: false }),
  getters: {
    onDuty: (state) => state.rows.filter((crew) => crew.duty_status === "ON_DUTY"),
    free: (state) => state.rows.filter((crew) => crew.current_ticket_id == null)
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listCrew();
      } finally {
        this.loading = false;
      }
    },
    async setDutyStatus(crewId: number, dutyStatus: string) {
      await setCrewDutyStatus(crewId, dutyStatus);
      await this.load();
    }
  }
});
