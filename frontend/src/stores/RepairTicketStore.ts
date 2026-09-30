import { defineStore } from "pinia";
import { listRepairTicket, dispatchTicket, transitionTicketStatus } from "../api/RepairTicket";
import { ApiError } from "../api/request";
import type { RepairTicket, DispatchResult, ConflictInfo } from "../types/RepairTicket";

interface State {
  rows: RepairTicket[];
  loading: boolean;
  dispatching: boolean;
  conflict: ConflictInfo | null;
  lastResult: DispatchResult | null;
}

export const useRepairTicketStore = defineStore("repairTicket", {
  state: (): State => ({
    rows: [],
    loading: false,
    dispatching: false,
    conflict: null,
    lastResult: null
  }),
  getters: {
    waitDispatch: (state) => state.rows.filter((ticket) => ticket.status === "WAIT_DISPATCH"),
    inProgress: (state) =>
      state.rows.filter((ticket) => ["ASSIGNED", "ARRIVED", "REPAIRING"].includes(ticket.status)),
    finished: (state) => state.rows.filter((ticket) => ["RESTORED", "CLOSED"].includes(ticket.status))
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listRepairTicket();
      } finally {
        this.loading = false;
      }
    },

    /**
     * 派工。两位调度员同时保存时，落败方收到 409：
     * 记录冲突工单并重新拉取最新状态，驱动前端重新计算候选。
     */
    async dispatch(ticketId: number, teamId: number): Promise<DispatchResult | null> {
      this.dispatching = true;
      this.conflict = null;
      this.lastResult = null;
      try {
        const result = await dispatchTicket(ticketId, teamId);
        this.lastResult = result;
        await this.load();
        return result;
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          this.conflict = {
            code: err.code,
            message: err.message,
            ticket: err.body.ticket as RepairTicket | undefined,
            crew: err.body.crew as ConflictInfo["crew"],
            requiredSkill: err.body.requiredSkill as string | undefined
          };
          await this.load(); // 状态已变，刷新后候选失效重算
          return null;
        }
        throw err;
      } finally {
        this.dispatching = false;
      }
    },

    async transition(ticketId: number, status: string) {
      await transitionTicketStatus(ticketId, status);
      await this.load();
    },

    clearConflict() {
      this.conflict = null;
    }
  }
});
