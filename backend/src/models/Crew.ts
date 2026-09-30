import type { DutyStatus } from "../constants/DutyStatus";

export interface Crew {
  id: number;
  name: string;
  leader_id: number;
  /** 逗号分隔的 SkillTag，派工时按故障类型做技能匹配。 */
  skill_tags: string;
  duty_status: DutyStatus;
  /** 当前未结工单 id；为 null 表示空闲，可被派工。 */
  current_ticket_id: number | null;
  contact_phone: string;
}

export interface VersionedCrew extends Crew {
  version: number;
}
