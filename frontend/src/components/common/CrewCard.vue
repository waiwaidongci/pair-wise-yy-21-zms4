<script setup lang="ts">
import { computed } from "vue";
import type { Crew } from "../../types/Crew";
import StatusBadge from "./StatusBadge.vue";

const props = defineProps<{
  crew: Crew;
  disabled?: boolean;
  dispatching?: boolean;
}>();

const emit = defineEmits<{ (e: "dispatch", crew: Crew): void }>();

const skills = computed(() => props.crew.skill_tags.split(",").map((tag) => tag.trim()));
const occupied = computed(() => props.crew.current_ticket_id != null);
</script>

<template>
  <div class="crew-card" :class="{ 'is-occupied': occupied }">
    <div class="crew-head">
      <strong>{{ crew.name }}</strong>
      <StatusBadge :value="crew.duty_status" />
    </div>
    <div class="crew-skills">
      <span v-for="skill in skills" :key="skill" class="skill-tag">{{ skill }}</span>
    </div>
    <div class="crew-meta">
      <span>联系：{{ crew.contact_phone }}</span>
      <span v-if="occupied" class="occupied-note">未结工单 #{{ crew.current_ticket_id }}</span>
    </div>
    <button
      class="dispatch-btn"
      :disabled="disabled || dispatching || occupied"
      @click="emit('dispatch', crew)"
    >
      {{ dispatching ? "派工中…" : occupied ? "班组占用中" : "派给该班组" }}
    </button>
  </div>
</template>

<style scoped>
.crew-card {
  border: 1px solid #d8d6c8;
  border-radius: 8px;
  padding: 14px;
  background: #fbfaf4;
  display: grid;
  gap: 10px;
}
.crew-card.is-occupied { opacity: 0.7; }
.crew-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.crew-skills { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-tag {
  font-size: 12px;
  background: #eef1e8;
  border: 1px solid #d8d6c8;
  border-radius: 4px;
  padding: 1px 8px;
  color: #274335;
}
.crew-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #596257;
}
.occupied-note { color: #9c2b2b; font-weight: 700; }
.dispatch-btn {
  border: 0;
  border-radius: 6px;
  padding: 8px 12px;
  background: #274335;
  color: #f5f1e6;
  font-weight: 700;
  cursor: pointer;
}
.dispatch-btn:disabled { background: #c9d0c3; cursor: not-allowed; }
</style>
