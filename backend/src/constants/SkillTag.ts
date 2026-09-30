/**
 * 班组技能标签。抢修班组用逗号拼接的形式存储 skill_tags，
 * 派工候选计算时与 FaultType 做匹配（见 FaultTypeSkillMap）。
 */
export const SkillTag = [
  "OUTAGE_REPAIR",
  "LINE_WORK",
  "CABLE_REPAIR",
  "TRANSFORMER_REPAIR",
  "EMERGENCY_RESCUE",
  "METERING_REPAIR"
] as const;
export type SkillTag = (typeof SkillTag)[number];

/** 故障类型 -> 该故障必须命中的至少一个技能标签 */
export const FaultTypeSkillMap: Record<string, SkillTag[]> = {
  OUTAGE: ["OUTAGE_REPAIR", "EMERGENCY_RESCUE"],
  VOLTAGE_LOW: ["OUTAGE_REPAIR", "TRANSFORMER_REPAIR"],
  TRIP: ["LINE_WORK", "OUTAGE_REPAIR"],
  EQUIPMENT_DAMAGE: ["TRANSFORMER_REPAIR", "CABLE_REPAIR", "LINE_WORK"],
  SAFETY_RISK: ["EMERGENCY_RESCUE", "LINE_WORK"]
};

export const parseSkillTags = (raw: string | null | undefined): SkillTag[] =>
  (raw ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag): tag is SkillTag => (SkillTag as readonly string[]).includes(tag));
