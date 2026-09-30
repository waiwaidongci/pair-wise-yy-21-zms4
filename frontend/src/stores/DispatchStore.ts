import { defineStore } from "pinia";
import {
  fetchDispatchCandidates,
  saveDispatch,
  saveTicketTransition,
  type DispatcherIdentity
} from "../api/Dispatch";
import { switchCrewDuty } from "../api/Crew";
import { createDispatchRequestBody } from "../constructors/DispatchConstructor";
import { ApiError } from "../api/http";
import type {
  CrewCandidate,
  DispatchCandidates,
  TicketAction
} from "../types/Dispatch";
import { useRepairTicketStore } from "./RepairTicketStore";
import { useCrewStore } from "./CrewStore";
import { useGridAssetStore } from "./GridAssetStore";
import { useFaultReportStore } from "./FaultReportStore";

interface DispatchState {
  activeTicketId: number | null;
  bundle: DispatchCandidates | null;
  loadingCandidates: boolean;
  saving: boolean;
  lastConflictAt: string | null;
  notice: { tone: "conflict" | "ok" | "error" | "info"; text: string } | null;
}

const syncEntityStores = (bundle: DispatchCandidates) => {
  const ticketStore = useRepairTicketStore();
  const crewStore = useCrewStore();
  const assetStore = useGridAssetStore();
  const faultStore = useFaultReportStore();
  ticketStore.upsert(bundle.dispatchTicket.ticket);
  faultStore.rows = faultStore.rows.map((row) =>
    row.id === bundle.dispatchTicket.faultReport.id
      ? bundle.dispatchTicket.faultReport
      : row
  );
  if (bundle.dispatchTicket.asset) assetStore.upsert(bundle.dispatchTicket.asset);
  for (const crew of bundle.candidates) {
    crewStore.upsert(stripCandidate(crew));
  }
};

const stripCandidate = (candidate: CrewCandidate) => {
  const { eligible, matched_skills, reject_reason, ...crew } = candidate;
  void eligible;
  void matched_skills;
  void reject_reason;
  return crew;
};

export const useDispatchStore = defineStore("dispatch", {
  state: (): DispatchState => ({
    activeTicketId: null,
    bundle: null,
    loadingCandidates: false,
    saving: false,
    lastConflictAt: null,
    notice: null
  }),
  getters: {
    ticket(state) {
      return state.bundle?.dispatchTicket.ticket ?? null;
    },
    candidates(state): CrewCandidate[] {
      return state.bundle?.candidates ?? [];
    },
    eligibleCandidates(): CrewCandidate[] {
      return this.candidates.filter((candidate) => candidate.eligible);
    },
    stale(state): boolean {
      return state.bundle?.dispatchTicket.ticket.status !== "WAIT_DISPATCH";
    }
  },
  actions: {
    /** 重新计算候选；工单或班组状态变化后调用，旧候选随即失效。 */
    async selectTicket(ticketId: number) {
      this.activeTicketId = ticketId;
      this.loadingCandidates = true;
      this.notice = null;
      try {
        const bundle = await fetchDispatchCandidates(ticketId);
        this.bundle = bundle;
        syncEntityStores(bundle);
      } catch (err) {
        if (err instanceof ApiError && err.isConflict() && err.details) {
          // 工单已不处于待派：展示冲突工单 + 重算候选
          this.bundle = err.details;
          this.lastConflictAt = new Date().toISOString();
          syncEntityStores(err.details);
          this.notice = { tone: "conflict", text: err.message };
        } else if (err instanceof ApiError) {
          this.notice = { tone: "error", text: err.message };
        } else {
          this.notice = { tone: "error", text: "候选计算失败，请稍后重试" };
        }
      } finally {
        this.loadingCandidates = false;
      }
    },

    async refreshCandidates() {
      if (this.activeTicketId != null) await this.selectTicket(this.activeTicketId);
    },

    /** 派工成功后切下一张待派单：重算候选但保留成功提示。 */
    async selectTicketPreserveNotice(ticketId: number) {
      const previousNotice = this.notice;
      await this.selectTicket(ticketId);
      if (previousNotice?.tone === "ok") this.notice = previousNotice;
    },

    /**
     * 派工保存：携带打开候选时的版本号。
     * 落败（409）时用后端返回的冲突工单与候选直接替换当前视图。
     */
    async confirmDispatch(crewId: number, dispatcher: DispatcherIdentity, simulateWriteFailure?: "afterTicket" | "afterCrew") {
      const bundle = this.bundle;
      if (!bundle) return { ok: false as const };
      const candidate = bundle.candidates.find((crew) => crew.id === crewId);
      const payload = createDispatchRequestBody(
        bundle.dispatchTicket.ticket.id,
        crewId,
        bundle.dispatchTicket.ticket.version,
        candidate?.version ?? 1
      );
      this.saving = true;
      try {
        const result = await saveDispatch(payload, { dispatcher, simulateWriteFailure });
        this.bundle = {
          dispatchTicket: result.dispatchTicket,
          candidates: result.candidates,
          calculatedAt: result.calculatedAt
        };
        syncEntityStores(this.bundle);
        this.notice = {
          tone: "ok",
          text: `派工成功：${result.assignedCrew.name} 已承接工单 ${result.dispatchTicket.ticket.id}`
        };
        return { ok: true as const };
      } catch (err) {
        if (err instanceof ApiError && err.isConflict() && err.details) {
          this.bundle = err.details;
          this.lastConflictAt = new Date().toISOString();
          syncEntityStores(err.details);
          this.notice = { tone: "conflict", text: err.message };
        } else if (err instanceof ApiError) {
          this.notice = { tone: "error", text: err.message };
        } else {
          this.notice = { tone: "error", text: "派工失败，请重试" };
        }
        return { ok: false as const };
      } finally {
        this.saving = false;
      }
    },

    /** 状态流转（到场/抢修/复电/归档），同样按版本提交、冲突重算。 */
    async transition(action: TicketAction, dispatcher: DispatcherIdentity) {
      const current = this.bundle?.dispatchTicket.ticket;
      if (!current) return;
      this.saving = true;
      try {
        const updated = await saveTicketTransition(current.id, current.version, action, dispatcher);
        const ticketStore = useRepairTicketStore();
        ticketStore.upsert(updated);
        await this.refreshCandidates();
        this.notice = { tone: "ok", text: `工单 ${updated.id} 已更新为 ${updated.status}` };
      } catch (err) {
        if (err instanceof ApiError && err.isConflict() && err.details) {
          this.bundle = err.details;
          this.lastConflictAt = new Date().toISOString();
          syncEntityStores(err.details);
          this.notice = { tone: "conflict", text: err.message };
        } else if (err instanceof ApiError) {
          this.notice = { tone: "error", text: err.message };
        }
      } finally {
        this.saving = false;
      }
    },

    clearNotice() {
      this.notice = null;
    },

    /**
     * 班组当值切换：后端会推进班组版本，旧候选立即失效；
     * 成功/失败后都按最新台账重算当前工单候选。
     */
    async toggleCrewDuty(crewId: number, nextDuty: "ON_DUTY" | "OFF_DUTY", version: number, dispatcher: DispatcherIdentity) {
      this.saving = true;
      try {
        const crew = await switchCrewDuty(crewId, version, nextDuty, dispatcher);
        useCrewStore().upsert(crew);
        this.notice = {
          tone: "ok",
          text: `${crew.name} 已切换为${nextDuty === "ON_DUTY" ? "当值" : "休息"}，候选已重新计算`
        };
      } catch (err) {
        if (err instanceof ApiError) this.notice = { tone: "error", text: err.message };
      } finally {
        this.saving = false;
        if (this.activeTicketId != null) await this.selectTicket(this.activeTicketId);
      }
    }
  }
});
