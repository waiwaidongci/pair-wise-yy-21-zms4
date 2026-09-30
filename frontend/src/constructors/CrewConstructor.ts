import type { Crew } from "../types/Crew";

export const createDefaultCrew = (overrides: Partial<Crew> = {}): Crew => ({
  id: 0,
  name: "",
  leader_id: 0,
  skill_tags: "",
  skill_tag_list: [],
  duty_status: "ON_DUTY",
  current_ticket_id: null,
  contact_phone: "",
  version: 1,
  ...overrides
});

export const createCrewForm = createDefaultCrew;
export const createCrewResponse = createDefaultCrew;
