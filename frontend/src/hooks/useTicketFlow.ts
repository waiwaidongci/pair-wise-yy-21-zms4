import { computed } from "vue";
import type { Ref } from "vue";
import type { RepairTicket } from "../types/RepairTicket";
import type { TicketAction } from "../types/Dispatch";
import { TicketStatusFlow } from "../constants/TicketStatus";

/** 工单流转：给出当前状态允许的下一动作及动作文案。 */
const ACTION_LABEL: Record<TicketAction, string> = {
  ARRIVE: "确认到场",
  REPAIR: "开始抢修",
  RESTORE: "复电确认",
  CLOSE: "归档"
};

const NEXT_STATUS_ACTION: Record<string, TicketAction> = {
  WAIT_DISPATCH: "ARRIVE",
  ASSIGNED: "ARRIVE",
  ARRIVED: "REPAIR",
  REPAIRING: "RESTORE",
  RESTORED: "CLOSE",
  CLOSED: "CLOSE"
};

export function useTicketFlow(ticket: Ref<RepairTicket | undefined> | (() => RepairTicket | undefined)) {
  const row = computed(() =>
    typeof ticket === "function" ? ticket() : ticket.value
  );

  const nextAction = computed<TicketAction | null>(() => {
    const status = row.value?.status;
    if (!status) return null;
    const next = TicketStatusFlow[status];
    if (!next) return null;
    return NEXT_STATUS_ACTION[next] ?? null;
  });

  const nextActionLabel = computed(() =>
    nextAction.value ? ACTION_LABEL[nextAction.value] : ""
  );

  const isRestored = computed(() => row.value?.status === "RESTORED");
  const canDispatch = computed(() => row.value?.status === "WAIT_DISPATCH");

  return { nextAction, nextActionLabel, isRestored, canDispatch };
}
