<script setup lang="ts">
import { onMounted } from "vue";
import { useSparePartUsageStore } from "../stores/SparePartUsageStore";
import StatusBadge from "../components/common/StatusBadge.vue";

const partsStore = useSparePartUsageStore();

onMounted(() => partsStore.load());
</script>

<template>
  <section class="parts-page">
    <div class="panel">
      <h2>备件领用记录</h2>
      <el-table :data="partsStore.rows" stripe>
        <el-table-column prop="id" label="单号" width="70" />
        <el-table-column prop="ticket_id" label="工单" />
        <el-table-column prop="part_code" label="备件编号" />
        <el-table-column prop="part_name" label="备件名称" />
        <el-table-column prop="quantity" label="数量" />
        <el-table-column prop="warehouse_name" label="仓库" />
        <el-table-column prop="approved_by" label="审批人" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <StatusBadge :value="row.usage_status" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<style scoped>
.panel { background: #fbfaf4; border: 1px solid #d8d6c8; border-radius: 8px; padding: 18px; }
</style>
