import { computed, type Ref } from "vue";
import { FaultTypeSkillMap } from "../constants/SkillTag";
import { parseSkillTags } from "../constants/SkillTag";
import type { CrewCandidate } from "../types/Dispatch";
import type { Crew } from "../types/Crew";

/**
 * 班组可用性筛选（与后端 dispatchCandidateService 同口径的前端镜像）：
 * 技能匹配 + 当值 + 无未结工单。任何班组状态变化都应重新取数后再跑一次。
 */
export function useCrewAvailability(crews: Ref<Crew[]> | Crew[], faultType: Ref<string> | string) {
  const crewList = computed<Crew[]>(() =>
    Array.isArray(crews) ? crews : crews.value
  );
  const fault = computed(() => (typeof faultType === "string" ? faultType : faultType.value));

  const candidates = computed<CrewCandidate[]>(() => {
    const required = FaultTypeSkillMap[fault.value as keyof typeof FaultTypeSkillMap] ?? [];
    return crewList.value.map((crew) => {
      const tags = parseSkillTags(crew.skill_tags);
      const matched = required.filter((skill) => tags.includes(skill));
      let reject_reason: CrewCandidate["reject_reason"] = null;
      if (crew.duty_status !== "ON_DUTY") reject_reason = "NOT_ON_DUTY";
      else if (crew.current_ticket_id !== null) reject_reason = "CREW_BUSY";
      else if (matched.length === 0) reject_reason = "SKILL_NOT_MATCHED";
      return {
        ...crew,
        eligible: reject_reason === null,
        matched_skills: matched,
        reject_reason
      };
    });
  });

  const availableCrews = computed(() => candidates.value.filter((crew) => crew.eligible));

  return { candidates, availableCrews };
}
