<script setup lang="ts">
import { computed } from "vue";
import { PriorityText, PriorityTone, type Priority } from "../../constants/Priority";

const props = defineProps<{ value: string }>();
const priority = computed(() => props.value as Priority);
</script>

<template>
  <span class="pri-tag" :class="`tone-${PriorityTone[priority] ?? 'muted'}`">
    {{ PriorityText[priority] ?? priority }}
  </span>
</template>
