import { db } from "../db";
import type { Crew } from "../models/Crew";

export const crewRepository = {
  findAll(): Crew[] {
    return db.crews;
  },
  findById(id: number): Crew | undefined {
    return db.crews.find((crew) => crew.id === id);
  },
  update(id: number, patch: Partial<Crew>): Crew | undefined {
    const crew = this.findById(id);
    if (!crew) return undefined;
    Object.assign(crew, patch);
    return crew;
  }
};
