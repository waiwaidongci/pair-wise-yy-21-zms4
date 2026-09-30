import { crewRepository } from "../repositories/CrewRepository";
import { createCrewDto, createCrewDtoList } from "../constructors/CrewDtoFactory";

export const crewService = {
  list: () => createCrewDtoList(crewRepository.findAll()),
  getById: (id: number) => {
    const row = crewRepository.findById(id);
    return row ? createCrewDto(row) : undefined;
  }
};
