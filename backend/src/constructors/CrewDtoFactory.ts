import type { Crew } from "../models/Crew";

export const createCrewDto = (overrides: Partial<Crew> = {}): Crew => ({
  id: 0,
  name: "",
  leader_id: 0,
  skill_tags: "",
  duty_status: "OFF_DUTY",
  current_ticket_id: null,
  contact_phone: "",
  ...overrides
});

/** 候选班组响应 DTO */
export const createCrewCandidateDto = (crew: Crew, matchedSkill: string | null) => ({
  ...crew,
  matchedSkill
});

export const createCrewForm = createCrewDto;
export const createCrewResponse = createCrewDto;
