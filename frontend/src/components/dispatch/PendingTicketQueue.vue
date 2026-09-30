<script setup lang="ts">
import type { RepairTicket } from "../../types/RepairTicket";
import PriorityTag from "../common/PriorityTag.vue";
import StatusBadge from "../common/StatusBadge.vue";

defineProps<{
  tickets: RepairTicket[];
  activeTicketId: number | null;
}>();

const emit = defineEmits<{ (e: "select", ticketId: number): void }>();
</script>

<template>
  <div class="queue">
    <h3>待派工单（{{ tickets.length }}）</h3>
    <p v-if="!tickets.length" class="empty-inline">暂无待派工单</p>
    <button
      v-for="ticket in tickets"
      :key="ticket.id"
      class="queue-item"
      :class="{ active: ticket.id === activeTicketId }"
      type="button"
      @click="emit('select', ticket.id)"
    >
      <span class="queue-id">#{{ ticket.id }}</span>
      <PriorityTag :value="ticket.priority" />
      <StatusBadge :value="ticket.status" kind="ticket" />
      <small>v{{ ticket.version }}</small>
    </button>
  </div>
</template>
