<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ value: string }>();

const PRIORITY_TEXT: Record<string, string> = {
  LOW: "低",
  NORMAL: "普通",
  HIGH: "高",
  URGENT: "紧急",
  CRITICAL: "特急"
};

const cls = computed(() => {
  switch (props.value) {
    case "URGENT":
    case "CRITICAL":
      return "is-danger";
    case "HIGH":
      return "is-warning";
    default:
      return "is-info";
  }
});

const text = computed(() => PRIORITY_TEXT[props.value] ?? props.value.replace(/_/g, " "));
</script>

<template>
  <span class="priority-tag" :class="cls">{{ text }}</span>
</template>

<style scoped>
.priority-tag {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 700;
  background: #eef0ee;
  color: #596257;
}
.priority-tag.is-warning { background: #fdf1dc; color: #8a5a12; }
.priority-tag.is-danger { background: #fbe4e4; color: #9c2b2b; }
.priority-tag.is-info { background: #eef0ee; color: #596257; }
</style>
