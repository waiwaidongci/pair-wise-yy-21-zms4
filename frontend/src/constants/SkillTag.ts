import type { FaultType } from "./FaultType";
import type { SkillTag } from "../types/SkillTag";

export const SkillTags: readonly SkillTag[] = [
  "OUTAGE_REPAIR",
  "LINE_WORK",
  "CABLE_REPAIR",
  "TRANSFORMER_REPAIR",
  "EMERGENCY_RESCUE",
  "METERING_REPAIR"
];

export const SkillTagText: Record<SkillTag, string> = {
  OUTAGE_REPAIR: "停电抢修",
  LINE_WORK: "线路作业",
  CABLE_REPAIR: "电缆检修",
  TRANSFORMER_REPAIR: "变压器检修",
  EMERGENCY_RESCUE: "应急救援",
  METERING_REPAIR: "计量检修"
};

/** 故障类型 -> 至少需要命中的技能之一，与后端 FaultTypeSkillMap 保持一致。 */
export const FaultTypeSkillMap: Record<FaultType, SkillTag[]> = {
  OUTAGE: ["OUTAGE_REPAIR", "EMERGENCY_RESCUE"],
  VOLTAGE_LOW: ["OUTAGE_REPAIR", "TRANSFORMER_REPAIR"],
  TRIP: ["LINE_WORK", "OUTAGE_REPAIR"],
  EQUIPMENT_DAMAGE: ["TRANSFORMER_REPAIR", "CABLE_REPAIR", "LINE_WORK"],
  SAFETY_RISK: ["EMERGENCY_RESCUE", "LINE_WORK"]
};

export const parseSkillTags = (raw: string): SkillTag[] =>
  raw
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag): tag is SkillTag => SkillTags.includes(tag as SkillTag));
