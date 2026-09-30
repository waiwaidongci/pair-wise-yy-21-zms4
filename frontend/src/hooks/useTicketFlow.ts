import { computed, ref, type Ref } from "vue";

/** 工单状态流转：当前状态 -> 允许的下一状态 */
const NEXT_STATUS: Record<string, string[]> = {
  WAIT_DISPATCH: ["ASSIGNED"],
  ASSIGNED: ["ARRIVED"],
  ARRIVED: ["REPAIRING"],
  REPAIRING: ["RESTORED"],
  RESTORED: ["CLOSED"],
  CLOSED: []
};

const STATUS_ACTION_TEXT: Record<string, string> = {
  ASSIGNED: "派工",
  ARRIVED: "到场",
  REPAIRING: "开始修复",
  RESTORED: "复电",
  CLOSED: "结案"
};

export function useTicketFlow(initialStatus: Ref<string> | string) {
  const status = typeof initialStatus === "string" ? ref(initialStatus) : initialStatus;

  const nextStatuses = computed(() => NEXT_STATUS[status.value] ?? []);
  const nextActions = computed(() =>
    nextStatuses.value.map((next) => ({ status: next, label: STATUS_ACTION_TEXT[next] ?? next }))
  );

  function canTransition(next: string) {
    return (NEXT_STATUS[status.value] ?? []).includes(next);
  }

  return { status, nextStatuses, nextActions, canTransition };
}
