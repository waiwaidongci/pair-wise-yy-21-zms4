<script setup lang="ts">
import { formatDate } from "../../utils/formatters";

export interface TimelineEntry {
  time: string | null;
  title: string;
  desc?: string;
  tone?: "done" | "active" | "todo";
}

defineProps<{ entries: TimelineEntry[] }>();
const fmt = (value: string | null) => (value ? formatDate(value) : "待发生");
</script>

<template>
  <ol class="timeline">
    <li v-for="(entry, index) in entries" :key="index" :class="entry.tone ?? 'todo'">
      <span class="dot" />
      <div>
        <strong>{{ entry.title }}</strong>
        <small>{{ fmt(entry.time) }}</small>
        <p v-if="entry.desc">{{ entry.desc }}</p>
      </div>
    </li>
  </ol>
</template>
