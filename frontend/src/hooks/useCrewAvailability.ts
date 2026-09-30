import { ref, watch, type Ref } from "vue";
import { listCandidates } from "../api/Crew";
import type { Crew } from "../types/Crew";

/**
 * 候选班组：基于后端实时计算（技能匹配、当值、无未结工单）。
 * 工单或班组状态变化时，调用 recompute() 或切换 ticketId 即重新拉取，
 * 原候选立即失效重算。
 */
export function useCrewAvailability(ticketId: Ref<number | null | undefined>) {
  const candidates = ref<Crew[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  let seq = 0;

  async function recompute() {
    const id = ticketId.value;
    if (id == null) {
      candidates.value = [];
      return;
    }
    const mySeq = ++seq;
    loading.value = true;
    error.value = null;
    try {
      const result = await listCandidates(id);
      if (mySeq === seq) {
        candidates.value = result;
      }
    } catch (err) {
      if (mySeq === seq) {
        error.value = (err as Error).message;
        candidates.value = [];
      }
    } finally {
      if (mySeq === seq) {
        loading.value = false;
      }
    }
  }

  watch(ticketId, recompute, { immediate: true });

  return { candidates, loading, error, recompute };
}
