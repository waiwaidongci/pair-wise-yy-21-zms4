<script setup lang="ts">
import { onMounted } from "vue";
import { useGridAssetStore } from "../stores/GridAssetStore";
import StatusBadge from "../components/common/StatusBadge.vue";

const assetStore = useGridAssetStore();

onMounted(() => assetStore.load());
</script>

<template>
  <section class="assets-page">
    <div class="panel">
      <h2>配网资产台账</h2>
      <el-table :data="assetStore.rows" stripe>
        <el-table-column prop="asset_code" label="资产编号" />
        <el-table-column prop="asset_type" label="类型" />
        <el-table-column prop="feeder_line" label="线路" />
        <el-table-column prop="voltage_level" label="电压等级" />
        <el-table-column prop="location_desc" label="位置" />
        <el-table-column label="健康状态">
          <template #default="{ row }">
            <StatusBadge :value="row.health_status" />
          </template>
        </el-table-column>
        <el-table-column prop="owner_team_id" label="归属班组" />
      </el-table>
    </div>
  </section>
</template>

<style scoped>
.panel { background: #fbfaf4; border: 1px solid #d8d6c8; border-radius: 8px; padding: 18px; }
</style>
