<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useSparePartUsageStore } from "../stores/SparePartUsageStore";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import StatusBadge from "../components/common/StatusBadge.vue";

const partStore = useSparePartUsageStore();
const ticketStore = useRepairTicketStore();
const { rows } = storeToRefs(partStore);

onMounted(async () => Promise.all([partStore.load(), ticketStore.load()]));

const ticketStatus = computed(() => (id: number) => ticketStore.byId(id)?.status ?? "—");
</script>

<template>
  <section class="ledger-panel">
    <h3 style="margin-bottom:10px">备件领用记录</h3>
    <table class="ledger-table">
      <thead>
        <tr><th>备件编码</th><th>名称</th><th>数量</th><th>仓库</th><th>工单/工单状态</th><th>使用状态</th></tr>
      </thead>
      <tbody>
        <tr v-for="part in rows" :key="part.id">
          <td>{{ part.part_code }}</td>
          <td>{{ part.part_name }}</td>
          <td>{{ part.quantity }}</td>
          <td>{{ part.warehouse_name }}</td>
          <td>#{{ part.ticket_id }} <StatusBadge :value="ticketStatus(part.ticket_id)" kind="ticket" /></td>
          <td><StatusBadge :value="part.usage_status" /></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
