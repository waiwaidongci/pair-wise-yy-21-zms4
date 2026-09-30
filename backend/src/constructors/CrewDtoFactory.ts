import { parseSkillTags, type SkillTag } from "../constants/SkillTag";
import type { VersionedCrew } from "../models/Crew";
import type { Crew } from "../models/Crew";

export interface CrewDto extends Crew {
  version: number;
  skill_tag_list: SkillTag[];
}

export const createCrewDto = (row: VersionedCrew): CrewDto => {
  const { version, skill_tags, ...fields } = row;
  return { ...fields, skill_tags, version, skill_tag_list: parseSkillTags(skill_tags) };
};

export const createCrewDtoList = (rows: VersionedCrew[]): CrewDto[] => rows.map(createCrewDto);
