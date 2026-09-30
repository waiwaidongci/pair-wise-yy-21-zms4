<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useFaultReportStore } from "../stores/FaultReportStore";
import { useGridAssetStore } from "../stores/GridAssetStore";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import StatusBadge from "../components/common/StatusBadge.vue";
import { formatFaultType } from "../utils/formatters";

const faultStore = useFaultReportStore();
const assetStore = useGridAssetStore();
const ticketStore = useRepairTicketStore();
const { rows } = storeToRefs(faultStore);

onMounted(async () => {
  await Promise.all([faultStore.load(), assetStore.load(), ticketStore.load()]);
});

const ticketOf = (faultId: number) =>
  ticketStore.rows.find((ticket) => ticket.fault_report_id === faultId);
const assetOf = (assetId: number) => assetStore.byId(assetId);
</script>

<template>
  <section class="ledger-panel">
    <h3 style="margin-bottom:10px">故障报修</h3>
    <table class="ledger-table">
      <thead>
        <tr><th>报修单</th><th>故障</th><th>地址</th><th>关联资产</th><th>关联工单</th><th>状态</th></tr>
      </thead>
      <tbody>
        <tr v-for="report in rows" :key="report.id">
          <td>#{{ report.id }}<br /><small class="muted">{{ report.reporter_name }}</small></td>
          <td>{{ formatFaultType(report.fault_type) }}</td>
          <td>{{ report.address_desc }}</td>
          <td>{{ assetOf(report.asset_id)?.asset_code ?? "—" }}</td>
          <td>{{ ticketOf(report.id) ? `#${ticketOf(report.id)!.id}` : "未生成" }}</td>
          <td><StatusBadge :value="report.status" /></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
