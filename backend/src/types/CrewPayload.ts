import type { DutyStatus } from "../constants/DutyStatus";

/** 班组当值切换请求体（当值状态变化会让原派工候选失效）。 */
export interface CrewDutyPayload {
  crewId: number;
  version: number;
  dutyStatus: DutyStatus;
}

export type CrewPayload = Partial<{
  name: string;
  skill_tags: string;
  duty_status: DutyStatus;
  contact_phone: string;
}>;
