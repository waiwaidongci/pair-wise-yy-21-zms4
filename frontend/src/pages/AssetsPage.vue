<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useGridAssetStore } from "../stores/GridAssetStore";
import StatusBadge from "../components/common/StatusBadge.vue";

const store = useGridAssetStore();
const { rows } = storeToRefs(store);
onMounted(() => store.load());
</script>

<template>
  <section class="ledger-panel">
    <h3 style="margin-bottom:10px">配网资产台账</h3>
    <table class="ledger-table">
      <thead>
        <tr><th>资产编码</th><th>类型</th><th>馈线</th><th>位置</th><th>健康状态</th><th>归属班组</th></tr>
      </thead>
      <tbody>
        <tr v-for="asset in rows" :key="asset.id">
          <td>{{ asset.asset_code }}</td>
          <td>{{ asset.asset_type }}</td>
          <td>{{ asset.feeder_line }}</td>
          <td>{{ asset.location_desc }}</td>
          <td><StatusBadge :value="asset.health_status" kind="health" /></td>
          <td>{{ asset.owner_team_id ? `#${asset.owner_team_id}` : "—" }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
