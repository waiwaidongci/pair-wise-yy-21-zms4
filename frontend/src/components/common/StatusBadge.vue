<script setup lang="ts">
import { computed } from "vue";
import { STATUS_TEXT } from "../../constants/statusText";

const props = defineProps<{ value: string }>();

const ALL_TEXT: Record<string, string> = {
  ...STATUS_TEXT.TicketStatus,
  ...STATUS_TEXT.FaultType,
  ...STATUS_TEXT.AssetHealthStatus,
  ON_DUTY: "当值",
  OFF_DUTY: "离岗",
  REPORTED: "已登记",
  DISPATCHED: "已派工",
  PENDING: "待处理",
  APPROVED: "已审批",
  CONSUMED: "已消耗"
};

const TYPE_CLASS: Record<string, string> = {
  WAIT_DISPATCH: "is-warning",
  ASSIGNED: "is-primary",
  ARRIVED: "is-primary",
  REPAIRING: "is-primary",
  RESTORED: "is-success",
  CLOSED: "is-info",
  ON_DUTY: "is-success",
  OFF_DUTY: "is-info",
  NORMAL: "is-success",
  WATCH: "is-warning",
  DEGRADED: "is-warning",
  DANGEROUS: "is-danger",
  CRITICAL: "is-danger"
};

const text = computed(() => ALL_TEXT[props.value] ?? props.value.replace(/_/g, " "));
const cls = computed(() => TYPE_CLASS[props.value] ?? "is-info");
</script>

<template>
  <span class="status-badge" :class="cls">{{ text }}</span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  border-radius: 999px;
  padding: 1px 10px;
  font-size: 12px;
  font-weight: 700;
  background: #e4efe4;
  color: #244b31;
}
.status-badge.is-primary { background: #e3eefb; color: #1d4e89; }
.status-badge.is-success { background: #e4efe4; color: #244b31; }
.status-badge.is-warning { background: #fdf1dc; color: #8a5a12; }
.status-badge.is-danger { background: #fbe4e4; color: #9c2b2b; }
.status-badge.is-info { background: #eef0ee; color: #596257; }
</style>
