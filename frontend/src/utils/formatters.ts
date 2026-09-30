import { TicketStatusText } from "../constants/TicketStatus";
import { PriorityText } from "../constants/Priority";
import { FaultTypeText } from "../constants/FaultType";
import { DutyStatusText } from "../constants/DutyStatus";
import { SkillTagText } from "../constants/SkillTag";
import { AssetHealthStatusText } from "../constants/AssetHealthStatus";

export const formatDate = (value: string | null | undefined): string => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("zh-CN", { hour12: false });
};

export const formatStatus = (value: string): string =>
  TicketStatusText[value as keyof typeof TicketStatusText] ?? value.replace(/_/g, " ");

export const formatPriority = (value: string): string =>
  PriorityText[value as keyof typeof PriorityText] ?? value;

export const formatFaultType = (value: string): string =>
  FaultTypeText[value as keyof typeof FaultTypeText] ?? value;

export const formatDutyStatus = (value: string): string =>
  DutyStatusText[value as keyof typeof DutyStatusText] ?? value;

export const formatSkillTag = (value: string): string =>
  SkillTagText[value as keyof typeof SkillTagText] ?? value;

export const formatHealthStatus = (value: string): string =>
  AssetHealthStatusText[value as keyof typeof AssetHealthStatusText] ?? value;

export const formatNumber = (value: number): string => new Intl.NumberFormat("zh-CN").format(value);

export const formatRisk = (value: string): string =>
  ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

/** 候选失效原因文案（与后端 CandidateRejectReason 对齐）。 */
export const formatRejectReason = (reason: string | null): string =>
  reason === null
    ? ""
    : ({
        SKILL_NOT_MATCHED: "技能不匹配",
        NOT_ON_DUTY: "班组未当值",
        CREW_BUSY: "持有未结工单"
      }[reason] ?? reason);
