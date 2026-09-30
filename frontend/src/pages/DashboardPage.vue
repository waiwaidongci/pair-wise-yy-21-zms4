<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useCrewStore } from "../stores/CrewStore";
import { useGridAssetStore } from "../stores/GridAssetStore";
import StatCard from "../components/common/StatCard.vue";
import StatusBadge from "../components/common/StatusBadge.vue";

const ticketStore = useRepairTicketStore();
const crewStore = useCrewStore();
const assetStore = useGridAssetStore();

const onDutyCrew = computed(() => crewStore.rows.filter((c) => c.duty_status === "ON_DUTY").length);
const dangerousAssets = computed(() => assetStore.rows.filter((a) => a.health_status === "DANGEROUS" || a.health_status === "DEGRADED").length);

const avgRestoreHours = computed(() => {
  const restored = ticketStore.rows.filter((t) => t.restored_at && t.assigned_at);
  if (!restored.length) return "—";
  const total = restored.reduce((sum, t) => {
    const ms = new Date(t.restored_at!).getTime() - new Date(t.assigned_at!).getTime();
    return sum + ms / 3_600_000;
  }, 0);
  return (total / restored.length).toFixed(1);
});

onMounted(async () => {
  await Promise.all([ticketStore.load(), crewStore.load(), assetStore.load()]);
});
</script>

<template>
  <section class="dashboard">
    <div class="metrics">
      <StatCard label="待派工工单" :value="ticketStore.waitDispatch.length" />
      <StatCard label="抢修中工单" :value="ticketStore.inProgress.length" />
      <StatCard label="已复电工单" :value="ticketStore.finished.length" />
      <StatCard label="当值班组" :value="onDutyCrew" />
      <StatCard label="危险/劣化资产" :value="dangerousAssets" />
      <StatCard label="平均复电(小时)" :value="avgRestoreHours" />
    </div>

    <div class="panel">
      <h2>班组状态</h2>
      <article v-for="crew in crewStore.rows" :key="crew.id" class="row">
        <strong>{{ crew.name }}</strong>
        <span>{{ crew.skill_tags }}</span>
        <StatusBadge :value="crew.duty_status" />
        <span>{{ crew.current_ticket_id ? `工单 #${crew.current_ticket_id}` : "空闲" }}</span>
      </article>
    </div>
  </section>
</template>

<style scoped>
.dashboard { display: grid; gap: 18px; }
.metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.panel { background: #fbfaf4; border: 1px solid #d8d6c8; border-radius: 8px; padding: 18px; }
.row { display: grid; grid-template-columns: 1.2fr 1.5fr auto auto; align-items: center; gap: 12px; border-top: 1px solid #e4e0d3; padding: 12px 0; }
</style>
