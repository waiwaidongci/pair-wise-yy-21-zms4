import type { DutyStatus } from "./DutyStatus";
import type { SkillTag } from "./SkillTag";

export interface Crew {
  id: number;
  name: string;
  leader_id: number;
  skill_tags: string;
  skill_tag_list: SkillTag[];
  duty_status: DutyStatus;
  current_ticket_id: number | null;
  contact_phone: string;
  version: number;
}
