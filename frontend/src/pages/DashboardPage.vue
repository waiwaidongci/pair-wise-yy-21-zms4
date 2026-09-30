<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useCrewStore } from "../stores/CrewStore";
import StatCard from "../components/common/StatCard.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import PriorityTag from "../components/common/PriorityTag.vue";
import { formatDate } from "../utils/formatters";

const ticketStore = useRepairTicketStore();
const crewStore = useCrewStore();
const { rows: tickets } = storeToRefs(ticketStore);
const { rows: crews } = storeToRefs(crewStore);

onMounted(async () => {
  await ticketStore.load();
  await crewStore.load();
});

const waiting = computed(() => tickets.value.filter((t) => t.status === "WAIT_DISPATCH").length);
const repairing = computed(() =>
  tickets.value.filter((t) => ["ASSIGNED", "ARRIVED", "REPAIRING"].includes(t.status)).length
);
const freeOnDuty = computed(
  () => crews.value.filter((c) => c.duty_status === "ON_DUTY" && c.current_ticket_id === null).length
);
const avgRestore = computed(() => {
  const restored = tickets.value.filter((t) => t.restored_at && t.assigned_at);
  if (!restored.length) return "—";
  const minutes =
    restored.reduce(
      (sum, t) =>
        sum + (new Date(t.restored_at!).getTime() - new Date(t.assigned_at!).getTime()) / 60000,
      0
    ) / restored.length;
  return `${Math.round(minutes)} 分钟`;
});
</script>

<template>
  <section class="metrics">
    <StatCard label="待派工单" :value="waiting" />
    <StatCard label="在途抢修" :value="repairing" />
    <StatCard label="当值空闲班组" :value="freeOnDuty" />
    <StatCard label="平均复电时长" :value="avgRestore" />
  </section>
  <section class="ledger-panel">
    <h3 style="margin-bottom:10px">抢修进度</h3>
    <table class="ledger-table">
      <thead>
        <tr><th>工单</th><th>优先级</th><th>状态</th><th>班组</th><th>派工时间</th><th>复电时间</th></tr>
      </thead>
      <tbody>
        <tr v-for="ticket in tickets" :key="ticket.id">
          <td>#{{ ticket.id }}</td>
          <td><PriorityTag :value="ticket.priority" /></td>
          <td><StatusBadge :value="ticket.status" kind="ticket" /></td>
          <td>{{ ticket.team_id ? `#${ticket.team_id}` : "—" }}</td>
          <td>{{ formatDate(ticket.assigned_at) }}</td>
          <td>{{ formatDate(ticket.restored_at) }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
