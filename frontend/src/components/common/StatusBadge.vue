<script setup lang="ts">
import { computed } from "vue";
import { TicketStatusText, TicketStatusTone, type TicketStatus } from "../../constants/TicketStatus";
import { DutyStatusText, type DutyStatus } from "../../constants/DutyStatus";
import { AssetHealthStatusText, AssetHealthStatusTone, type AssetHealthStatus } from "../../constants/AssetHealthStatus";
import { formatStatus } from "../../utils/formatters";

const props = withDefaults(
  defineProps<{
    value: string;
    kind?: "ticket" | "duty" | "health" | "raw";
  }>(),
  { kind: "raw" }
);

const toneClass = computed(() => {
  if (props.kind === "ticket") {
    return `tone-${TicketStatusTone[props.value as TicketStatus] ?? "muted"}`;
  }
  if (props.kind === "health") {
    return `tone-${AssetHealthStatusTone[props.value as AssetHealthStatus] ?? "muted"}`;
  }
  if (props.kind === "duty") {
    return props.value === "ON_DUTY" ? "tone-ok" : "tone-muted";
  }
  return "tone-info";
});

const text = computed(() => {
  if (props.kind === "ticket") return TicketStatusText[props.value as TicketStatus] ?? props.value;
  if (props.kind === "duty") return DutyStatusText[props.value as DutyStatus] ?? props.value;
  if (props.kind === "health") {
    return AssetHealthStatusText[props.value as AssetHealthStatus] ?? props.value;
  }
  return formatStatus(props.value);
});
</script>

<template>
  <span class="badge" :class="toneClass">{{ text }}</span>
</template>
