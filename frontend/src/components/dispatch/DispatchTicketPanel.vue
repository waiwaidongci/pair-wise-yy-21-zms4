<script setup lang="ts">
import { computed } from "vue";
import type { DispatchTicketView, TicketAction } from "../../types/Dispatch";
import type { TimelineEntry } from "../common/TimelineList.vue";
import StatusBadge from "../common/StatusBadge.vue";
import PriorityTag from "../common/PriorityTag.vue";
import TimelineList from "../common/TimelineList.vue";
import { formatDate, formatFaultType } from "../../utils/formatters";

const props = defineProps<{
  view: DispatchTicketView | null;
  nextAction: TicketAction | null;
  nextActionLabel: string;
  saving: boolean;
}>();

const emit = defineEmits<{ (e: "transition"): void; (e: "recalculate"): void }>();

const entries = computed<TimelineEntry[]>(() => {
  const ticket = props.view?.ticket;
  if (!ticket) return [];
  const isAfter = (status: string) => {
    const chain = ["WAIT_DISPATCH", "ASSIGNED", "ARRIVED", "REPAIRING", "RESTORED", "CLOSED"];
    return chain.indexOf(ticket.status) >= chain.indexOf(status);
  };
  const toneOf = (status: string): TimelineEntry["tone"] => {
    const chain = ["WAIT_DISPATCH", "ASSIGNED", "ARRIVED", "REPAIRING", "RESTORED", "CLOSED"];
    const idx = chain.indexOf(ticket.status);
    const target = chain.indexOf(status);
    if (idx > target) return "done";
    if (idx === target) return "active";
    return "todo";
  };
  return [
    { time: null, title: "报修受理", desc: `报修单 #${ticket.fault_report_id}`, tone: "done" },
    { time: ticket.assigned_at, title: "派工到班组", desc: ticket.team_id ? `班组 #${ticket.team_id}` : "待派工", tone: toneOf("ASSIGNED") },
    { time: isAfter("ARRIVED") ? ticket.assigned_at : null, title: "班组到场确认", tone: toneOf("ARRIVED") },
    { time: null, title: "现场抢修", tone: toneOf("REPAIRING") },
    { time: ticket.restored_at, title: "复电确认", desc: ticket.restored_at ? "已恢复供电" : "等待复电", tone: toneOf("RESTORED") },
    { time: null, title: "工单归档", tone: toneOf("CLOSED") }
  ];
});
</script>

<template>
  <section class="panel ticket-panel">
    <template v-if="view">
      <header class="panel-head">
        <div>
          <h3>抢修工单 #{{ view.ticket.id }}</h3>
          <div class="ticket-tags">
            <PriorityTag :value="view.ticket.priority" />
            <StatusBadge :value="view.ticket.status" kind="ticket" />
            <span class="muted">数据版本 v{{ view.ticket.version }}</span>
          </div>
        </div>
        <div class="head-side">
          <button type="button" class="btn btn-ghost" @click="emit('recalculate')">刷新状态</button>
          <button
            v-if="nextAction"
            type="button"
            class="btn"
            :class="nextAction === 'RESTORE' ? 'btn-success' : 'btn-primary'"
            :disabled="saving"
            @click="emit('transition')"
          >
            {{ saving ? "提交中…" : nextActionLabel }}
          </button>
        </div>
      </header>

      <div class="linked-entities">
        <article class="entity-card">
          <h4>故障报修</h4>
          <p><strong>{{ formatFaultType(view.faultReport.fault_type) }}</strong> · {{ view.faultReport.severity }}</p>
          <p>{{ view.faultReport.address_desc }}</p>
          <p class="muted">报修人：{{ view.faultReport.reporter_name }} {{ view.faultReport.phone }}</p>
        </article>
        <article class="entity-card">
          <h4>配网资产</h4>
          <template v-if="view.asset">
            <p><strong>{{ view.asset.asset_code }}</strong> · {{ view.asset.feeder_line }}</p>
            <p>{{ view.asset.location_desc }}</p>
            <p>
              健康状态：
              <StatusBadge :value="view.asset.health_status" kind="health" />
            </p>
          </template>
          <p v-else class="muted">未关联资产</p>
        </article>
        <article class="entity-card">
          <h4>派工信息</h4>
          <p>承接班组：{{ view.ticket.team_id ? `#${view.ticket.team_id}` : "未派出" }}</p>
          <p>派工时间：{{ formatDate(view.ticket.assigned_at) }}</p>
          <p>复电时间：{{ formatDate(view.ticket.restored_at) }}</p>
        </article>
      </div>

      <TimelineList :entries="entries" />
    </template>
    <div v-else class="empty-inline">请选择左侧待派工单查看派工台</div>
  </section>
</template>
