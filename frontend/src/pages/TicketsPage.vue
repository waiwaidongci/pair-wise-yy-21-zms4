<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useDispatchStore } from "../stores/DispatchStore";
import { useDispatcherIdentity } from "../hooks/useDispatcherIdentity";
import { useTicketFlow } from "../hooks/useTicketFlow";
import PendingTicketQueue from "../components/dispatch/PendingTicketQueue.vue";
import CandidatePanel from "../components/dispatch/CandidatePanel.vue";
import ConflictBanner from "../components/dispatch/ConflictBanner.vue";
import DispatchTicketPanel from "../components/dispatch/DispatchTicketPanel.vue";

const ticketStore = useRepairTicketStore();
const dispatchStore = useDispatchStore();
const { waitingTickets } = storeToRefs(ticketStore);
const { bundle, loadingCandidates, saving, notice, activeTicketId } = storeToRefs(dispatchStore);
const { current, presets, switchTo } = useDispatcherIdentity();

const selectedCrewId = ref<number | null>(null);
const simulateFailure = ref<"" | "afterTicket" | "afterCrew">("");

const ticketView = computed(() => bundle.value?.dispatchTicket ?? null);
const { nextAction, nextActionLabel } = useTicketFlow(() => ticketView.value?.ticket);

onMounted(async () => {
  await ticketStore.load();
  if (waitingTickets.value.length > 0) {
    await dispatchStore.selectTicket(waitingTickets.value[0].id);
  }
});

watch(
  () => bundle.value?.calculatedAt,
  () => {
    // 每次候选重算后清空勾选项，避免把旧候选的选择带入新候选
    selectedCrewId.value = null;
  }
);

const selectTicket = async (ticketId: number) => {
  selectedCrewId.value = null;
  await dispatchStore.selectTicket(ticketId);
};

const confirmDispatch = async () => {
  if (selectedCrewId.value === null) return;
  const result = await dispatchStore.confirmDispatch(
    selectedCrewId.value,
    current.value,
    simulateFailure.value || undefined
  );
  await ticketStore.load();
  simulateFailure.value = "";
  // 当前工单已派出：自动切到下一张待派单，继续派工（保留成功提示）
  if (result.ok && waitingTickets.value.length > 0) {
    selectedCrewId.value = null;
    dispatchStore.activeTicketId = waitingTickets.value[0].id;
    await dispatchStore.selectTicketPreserveNotice(waitingTickets.value[0].id);
  }
};

const recalculate = async () => {
  await dispatchStore.refreshCandidates();
  await ticketStore.load();
};

const runTransition = async () => {
  await dispatchStore.transition(nextAction.value!, current.value);
  await ticketStore.load();
};

const onToggleDuty = async (payload: {
  crewId: number;
  nextDuty: "ON_DUTY" | "OFF_DUTY";
  version: number;
}) => {
  await dispatchStore.toggleCrewDuty(
    payload.crewId,
    payload.nextDuty,
    payload.version,
    current.value
  );
  await ticketStore.load();
};
</script>

<template>
  <section class="dispatch-page">
    <header class="dispatch-head">
      <div>
        <p class="eyebrow">grid-repair / dispatch console</p>
        <h2>抢修派工台</h2>
        <p class="muted">候选规则：技能匹配 + 当值 + 无未结工单；两位调度员并发保存时仅一笔成立。</p>
      </div>
      <div class="dispatcher-switch">
        <span>当前调度员：</span>
        <button
          v-for="preset in presets"
          :key="preset.id"
          type="button"
          class="btn"
          :class="current.id === preset.id ? 'btn-primary' : 'btn-ghost'"
          @click="switchTo(preset.id)"
        >
          {{ preset.name }}#{{ preset.id }}
        </button>
        <label class="fault-inject">
          写入失败演练
          <select v-model="simulateFailure">
            <option value="">不注入</option>
            <option value="afterTicket">工单写入后失败（回滚）</option>
            <option value="afterCrew">班组占用后失败（回滚）</option>
          </select>
        </label>
      </div>
    </header>

    <ConflictBanner
      v-if="notice"
      :tone="notice.tone"
      :text="notice.text"
      :detail="bundle ? `冲突工单 #${bundle.dispatchTicket.ticket.id}，当前状态 ${bundle.dispatchTicket.ticket.status}，候选已按最新台账重算` : undefined"
      @recalculate="recalculate"
      @dismiss="dispatchStore.clearNotice()"
    />

    <div class="dispatch-layout">
      <aside class="queue-side">
        <PendingTicketQueue
          :tickets="waitingTickets"
          :active-ticket-id="activeTicketId"
          @select="selectTicket"
        />
        <div v-if="loadingCandidates" class="loading-hint">候选计算中…</div>
      </aside>

      <div class="dispatch-main">
        <DispatchTicketPanel
          :view="ticketView"
          :next-action="nextAction"
          :next-action-label="nextActionLabel"
          :saving="saving"
          @transition="runTransition"
          @recalculate="recalculate"
        />
        <CandidatePanel
          v-if="bundle"
          :candidates="bundle.candidates"
          :selected-crew-id="selectedCrewId"
          :calculated-at="bundle.calculatedAt"
          :saving="saving"
          @select="selectedCrewId = $event"
          @confirm="confirmDispatch"
          @recalculate="recalculate"
          @toggle-duty="onToggleDuty"
        />
      </div>
    </div>
  </section>
</template>
