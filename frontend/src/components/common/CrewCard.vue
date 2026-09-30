<script setup lang="ts">
import { computed } from "vue";
import type { CrewCandidate } from "../../types/Dispatch";
import StatusBadge from "./StatusBadge.vue";
import { formatSkillTag, formatRejectReason, formatDate } from "../../utils/formatters";

const props = withDefaults(
  defineProps<{
    candidate: CrewCandidate;
    selectable?: boolean;
    selected?: boolean;
    calculatedAt?: string;
  }>(),
  { selectable: false, selected: false, calculatedAt: "" }
);

const emit = defineEmits<{
  (e: "select", id: number): void;
  (e: "toggleDuty", payload: { crewId: number; nextDuty: "ON_DUTY" | "OFF_DUTY"; version: number }): void;
}>();

const skillText = computed(() =>
  props.candidate.skill_tag_list.map((tag) => formatSkillTag(tag)).join("、") || "—"
);
</script>

<template>
  <div
    class="crew-card"
    :class="{ disabled: !candidate.eligible, selected }"
    role="button"
    tabindex="0"
    @click="selectable && candidate.eligible && emit('select', candidate.id)"
    @keydown.enter="selectable && candidate.eligible && emit('select', candidate.id)"
  >
    <div class="crew-head">
      <strong>{{ candidate.name }}</strong>
      <span class="head-badges">
        <StatusBadge :value="candidate.duty_status" kind="duty" />
        <button
          type="button"
          class="mini-btn"
          @click.stop="emit('toggleDuty', { crewId: candidate.id, nextDuty: candidate.duty_status === 'ON_DUTY' ? 'OFF_DUTY' : 'ON_DUTY', version: candidate.version })"
        >
          {{ candidate.duty_status === "ON_DUTY" ? "下班" : "上班" }}
        </button>
      </span>
    </div>
    <ul class="crew-meta">
      <li><span>班长工号</span>{{ candidate.leader_id }}</li>
      <li><span>联系电话</span>{{ candidate.contact_phone }}</li>
      <li><span>技能</span>{{ skillText }}</li>
      <li>
        <span>当前工单</span>
        <template v-if="candidate.current_ticket_id === null">空闲</template>
        <template v-else>#{{ candidate.current_ticket_id }}（未结）</template>
      </li>
      <li v-if="candidate.matched_skills.length">
        <span>命中技能</span>{{ candidate.matched_skills.map(formatSkillTag).join("、") }}
      </li>
    </ul>
    <div class="crew-foot">
      <em v-if="candidate.eligible" class="ok-text">可派工</em>
      <em v-else class="danger-text">不可派：{{ formatRejectReason(candidate.reject_reason) }}</em>
      <small v-if="calculatedAt">候选版本 v{{ candidate.version }} · {{ formatDate(calculatedAt) }}</small>
      <small v-else>数据版本 v{{ candidate.version }}</small>
    </div>
  </div>
</template>
