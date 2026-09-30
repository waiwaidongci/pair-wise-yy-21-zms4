<script setup lang="ts">
import { computed } from "vue";
import type { CrewCandidate } from "../../types/Dispatch";
import CrewCard from "../common/CrewCard.vue";
import { formatDate } from "../../utils/formatters";

const props = defineProps<{
  candidates: CrewCandidate[];
  selectedCrewId: number | null;
  calculatedAt: string;
  saving: boolean;
}>();

const emit = defineEmits<{
  (e: "select", crewId: number): void;
  (e: "confirm"): void;
  (e: "recalculate"): void;
  (
    e: "toggleDuty",
    payload: { crewId: number; nextDuty: "ON_DUTY" | "OFF_DUTY"; version: number }
  ): void;
}>();

const eligibleCount = computed(() => props.candidates.filter((crew) => crew.eligible).length);
</script>

<template>
  <section class="panel candidate-panel">
    <header class="panel-head">
      <h3>候选抢修班组</h3>
      <div class="head-side">
        <span class="muted">{{ eligibleCount }} 个可派 · 共 {{ candidates.length }} 个班组</span>
        <button type="button" class="btn btn-ghost" @click="emit('recalculate')">重新计算</button>
      </div>
    </header>
    <p class="calc-at">候选计算时间：{{ formatDate(calculatedAt) }}（工单或班组状态变化后自动失效）</p>
    <div class="crew-grid">
      <CrewCard
        v-for="candidate in candidates"
        :key="candidate.id"
        :candidate="candidate"
        selectable
        :selected="candidate.id === selectedCrewId"
        @select="emit('select', $event)"
        @toggle-duty="emit('toggleDuty', $event)"
      />
    </div>
    <footer class="dispatch-bar">
      <span v-if="selectedCrewId === null" class="muted">请选择一个可派班组</span>
      <strong v-else>已选择班组 #{{ selectedCrewId }}</strong>
      <div class="bar-actions">
        <button
          type="button"
          class="btn btn-primary"
          :disabled="selectedCrewId === null || saving"
          @click="emit('confirm')"
        >
          {{ saving ? "保存中…" : "确认派工" }}
        </button>
      </div>
    </footer>
  </section>
</template>
