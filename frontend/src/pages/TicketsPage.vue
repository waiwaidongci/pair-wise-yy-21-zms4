<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useFaultReportStore } from "../stores/FaultReportStore";
import { useGridAssetStore } from "../stores/GridAssetStore";
import { useCrewStore } from "../stores/CrewStore";
import { useCrewAvailability } from "../hooks/useCrewAvailability";
import { useTicketFlow } from "../hooks/useTicketFlow";
import type { Crew } from "../types/Crew";
import StatusBadge from "../components/common/StatusBadge.vue";
import PriorityTag from "../components/common/PriorityTag.vue";
import CrewCard from "../components/common/CrewCard.vue";

const ticketStore = useRepairTicketStore();
const faultStore = useFaultReportStore();
const assetStore = useGridAssetStore();
const crewStore = useCrewStore();

const activeTab = ref<"WAIT_DISPATCH" | "ACTIVE" | "DONE">("WAIT_DISPATCH");
const selectedTicketId = ref<number | null>(null);

const { candidates, loading: candidatesLoading, recompute } = useCrewAvailability(selectedTicketId);

const selectedTicket = computed(() => ticketStore.rows.find((t) => t.id === selectedTicketId.value) ?? null);
const selectedReport = computed(() =>
  selectedTicket.value ? faultStore.rows.find((r) => r.id === selectedTicket.value!.fault_report_id) ?? null : null
);
const selectedAsset = computed(() =>
  selectedReport.value ? assetStore.rows.find((a) => a.id === selectedReport.value!.asset_id) ?? null : null
);

const flowStatus = computed(() => selectedTicket.value?.status ?? "");
const { nextActions } = useTicketFlow(flowStatus);

const tabTickets = computed(() => {
  if (activeTab.value === "WAIT_DISPATCH") return ticketStore.waitDispatch;
  if (activeTab.value === "ACTIVE") return ticketStore.inProgress;
  return ticketStore.finished;
});

function selectTicket(id: number) {
  selectedTicketId.value = id;
  ticketStore.clearConflict();
}

async function handleDispatch(crew: Crew) {
  if (!selectedTicket.value) return;
  const result = await ticketStore.dispatch(selectedTicket.value.id, crew.id);
  if (result) {
    ElMessage.success(`已派工给 ${result.crew.name}`);
    await recompute();
  } else if (ticketStore.conflict) {
    ElMessage.warning("派工冲突：该工单已被其他调度员派工");
    await recompute();
  }
}

async function handleTransition(status: string) {
  if (!selectedTicket.value) return;
  await ticketStore.transition(selectedTicket.value.id, status);
  ElMessage.success(`工单已流转为 ${status}`);
  await recompute();
}

async function handleRecompute() {
  ticketStore.clearConflict();
  await Promise.all([ticketStore.load(), faultStore.load(), assetStore.load(), crewStore.load()]);
  await recompute();
}

onMounted(async () => {
  await Promise.all([ticketStore.load(), faultStore.load(), assetStore.load(), crewStore.load()]);
});
</script>

<template>
  <section class="dispatch-console">
    <header class="console-head">
      <div>
        <p class="eyebrow">派工台</p>
        <h1>抢修工单派工</h1>
        <p class="sub">待派单可派给技能匹配、当值且无未结工单的抢修班组；派工同时写入工单、班组与配网资产。</p>
      </div>
      <div class="head-stats">
        <div class="stat"><span>待派工</span><strong>{{ ticketStore.waitDispatch.length }}</strong></div>
        <div class="stat"><span>处理中</span><strong>{{ ticketStore.inProgress.length }}</strong></div>
        <div class="stat"><span>已复电</span><strong>{{ ticketStore.finished.length }}</strong></div>
      </div>
    </header>

    <div class="console-body">
      <div class="ticket-list-panel panel">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="待派工" name="WAIT_DISPATCH" />
          <el-tab-pane label="处理中" name="ACTIVE" />
          <el-tab-pane label="已完成" name="DONE" />
        </el-tabs>
        <el-empty v-if="tabTickets.length === 0" description="暂无工单" :image-size="80" />
        <ul v-else class="ticket-list">
          <li
            v-for="ticket in tabTickets"
            :key="ticket.id"
            :class="{ active: ticket.id === selectedTicketId }"
            @click="selectTicket(ticket.id)"
          >
            <div class="ticket-row">
              <strong>#{{ ticket.id }}</strong>
              <PriorityTag :value="ticket.priority" />
              <StatusBadge :value="ticket.status" />
            </div>
            <div class="ticket-desc">
              {{ faultStore.rows.find((r) => r.id === ticket.fault_report_id)?.address_desc ?? "—" }}
            </div>
          </li>
        </ul>
      </div>

      <div class="ticket-detail-panel panel">
        <el-empty v-if="!selectedTicket" description="请选择一张工单" />
        <template v-else>
          <div class="detail-head">
            <h2>工单 #{{ selectedTicket.id }}</h2>
            <StatusBadge :value="selectedTicket.status" />
          </div>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="故障类型">{{ selectedReport?.fault_type ?? "—" }}</el-descriptions-item>
            <el-descriptions-item label="优先级"><PriorityTag :value="selectedTicket.priority" /></el-descriptions-item>
            <el-descriptions-item label="报修人">{{ selectedReport?.reporter_name ?? "—" }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ selectedReport?.phone ?? "—" }}</el-descriptions-item>
            <el-descriptions-item label="报修地址" :span="2">{{ selectedReport?.address_desc ?? "—" }}</el-descriptions-item>
            <el-descriptions-item label="配网资产">{{ selectedAsset?.asset_code ?? "—" }}</el-descriptions-item>
            <el-descriptions-item label="线路 / 电压">{{ selectedAsset?.feeder_line ?? "—" }} / {{ selectedAsset?.voltage_level ?? "—" }}</el-descriptions-item>
            <el-descriptions-item label="资产健康度"><StatusBadge :value="selectedAsset?.health_status ?? '—'" /></el-descriptions-item>
            <el-descriptions-item label="资产位置">{{ selectedAsset?.location_desc ?? "—" }}</el-descriptions-item>
          </el-descriptions>

          <!-- 冲突提示：落败方看到获胜工单并重新计算候选 -->
          <el-alert
            v-if="ticketStore.conflict"
            class="conflict-alert"
            type="warning"
            :closable="false"
            show-icon
            title="派工冲突"
          >
            <template #default>
              <div class="conflict-body">
                <p>{{ ticketStore.conflict.message }}</p>
                <p v-if="ticketStore.conflict.ticket">
                  获胜工单：#{{ ticketStore.conflict.ticket.id }}，状态 {{ ticketStore.conflict.ticket.status }}，
                  班组 #{{ ticketStore.conflict.ticket.team_id }}
                </p>
                <el-button size="small" type="primary" @click="handleRecompute">重新计算候选</el-button>
              </div>
            </template>
          </el-alert>

          <!-- 待派工：候选班组 -->
          <template v-if="selectedTicket.status === 'WAIT_DISPATCH'">
            <div class="candidates-head">
              <h3>候选班组</h3>
              <el-button text type="primary" @click="recompute">刷新候选</el-button>
            </div>
            <p class="candidates-rule">规则：技能匹配故障类型、当值、且无未结工单。</p>
            <div v-if="candidatesLoading" class="candidates-loading">候选计算中…</div>
            <el-empty v-else-if="candidates.length === 0" description="当前无可派班组" :image-size="70" />
            <div v-else class="candidates-grid">
              <CrewCard
                v-for="crew in candidates"
                :key="crew.id"
                :crew="crew"
                :dispatching="ticketStore.dispatching"
                @dispatch="handleDispatch"
              />
            </div>
          </template>

          <!-- 处理中：状态流转 -->
          <template v-else-if="nextActions.length">
            <div class="flow-head">
              <h3>状态流转</h3>
            </div>
            <div class="flow-actions">
              <el-button
                v-for="action in nextActions"
                :key="action.status"
                type="primary"
                @click="handleTransition(action.status)"
              >
                {{ action.label }}
              </el-button>
            </div>
          </template>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dispatch-console { display: grid; gap: 18px; }
.console-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.console-head h1 { margin: 0; font-size: 28px; }
.sub { margin: 6px 0 0; color: #596257; font-size: 13px; }
.head-stats { display: flex; gap: 10px; }
.head-stats .stat {
  background: #fbfaf4; border: 1px solid #d8d6c8; border-radius: 8px;
  padding: 10px 16px; display: grid; gap: 2px; text-align: center;
}
.head-stats .stat span { font-size: 12px; color: #596257; }
.head-stats .stat strong { font-size: 22px; color: #274335; }
.console-body { display: grid; grid-template-columns: 320px 1fr; gap: 18px; align-items: start; }
.panel { background: #fbfaf4; border: 1px solid #d8d6c8; border-radius: 8px; padding: 16px; }
.ticket-list { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 8px; }
.ticket-list li {
  border: 1px solid #e4e0d3; border-radius: 6px; padding: 10px; cursor: pointer;
  display: grid; gap: 6px; background: #fff;
}
.ticket-list li.active { border-color: #274335; background: #eef1e8; }
.ticket-row { display: flex; align-items: center; gap: 8px; }
.ticket-desc { font-size: 12px; color: #596257; }
.detail-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.detail-head h2 { margin: 0; }
.conflict-alert { margin: 14px 0; }
.conflict-body { display: grid; gap: 6px; }
.conflict-body p { margin: 0; }
.candidates-head { display: flex; align-items: center; justify-content: space-between; margin: 16px 0 4px; }
.candidates-head h3 { margin: 0; }
.candidates-rule { font-size: 12px; color: #596257; margin: 0 0 12px; }
.candidates-loading { padding: 24px; text-align: center; color: #596257; }
.candidates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.flow-head { margin: 16px 0 8px; }
.flow-head h3 { margin: 0; }
.flow-actions { display: flex; gap: 10px; }
@media (max-width: 900px) { .console-body { grid-template-columns: 1fr; } }
</style>
