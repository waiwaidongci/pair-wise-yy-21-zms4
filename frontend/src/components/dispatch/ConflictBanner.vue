<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  tone: "conflict" | "ok" | "error" | "info";
  text: string;
  detail?: string;
}>();

const emit = defineEmits<{ (e: "recalculate"): void; (e: "dismiss"): void }>();

const title = computed(() => {
  if (props.tone === "conflict") return "并发冲突";
  if (props.tone === "ok") return "操作成功";
  if (props.tone === "error") return "操作失败";
  return "提示";
});

const noticeClass = computed(() => "notice notice-" + props.tone);
</script>

<template>
  <div :class="noticeClass" role="alert">
    <div>
      <strong>{{ title }}</strong>
      <p>{{ text }}</p>
      <small v-if="detail">{{ detail }}</small>
    </div>
    <div class="notice-actions">
      <button
        v-if="tone === 'conflict'"
        type="button"
        class="btn btn-warn"
        @click="emit('recalculate')"
      >
        按最新状态重算候选
      </button>
      <button type="button" class="btn btn-ghost" @click="emit('dismiss')">知道了</button>
    </div>
  </div>
</template>
