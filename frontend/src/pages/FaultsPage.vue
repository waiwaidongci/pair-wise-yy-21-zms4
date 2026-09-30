<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useFaultReportStore } from "../stores/FaultReportStore";
import { useGridAssetStore } from "../stores/GridAssetStore";
import StatusBadge from "../components/common/StatusBadge.vue";
import PriorityTag from "../components/common/PriorityTag.vue";

const faultStore = useFaultReportStore();
const assetStore = useGridAssetStore();

const assetCode = computed(() => (id: number) => assetStore.rows.find((a) => a.id === id)?.asset_code ?? "—");

onMounted(async () => {
  await Promise.all([faultStore.load(), assetStore.load()]);
});
</script>

<template>
  <section class="faults-page">
    <div class="panel">
      <h2>故障报修</h2>
      <el-table :data="faultStore.rows" stripe>
        <el-table-column prop="id" label="单号" width="70" />
        <el-table-column prop="reporter_name" label="报修人" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column label="故障类型">
          <template #default="{ row }">
            <StatusBadge :value="row.fault_type" />
          </template>
        </el-table-column>
        <el-table-column prop="address_desc" label="地址" />
        <el-table-column label="严重程度">
          <template #default="{ row }">
            <PriorityTag :value="row.severity" />
          </template>
        </el-table-column>
        <el-table-column prop="report_channel" label="渠道" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <StatusBadge :value="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="资产">
          <template #default="{ row }">{{ assetCode(row.asset_id) }}</template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<style scoped>
.panel { background: #fbfaf4; border: 1px solid #d8d6c8; border-radius: 8px; padding: 18px; }
</style>
