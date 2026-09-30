import { mockData } from "../mocks/seedData";
import type { Crew } from "../types/Crew";
import type { DutyStatus } from "../types/DutyStatus";
import { requestJson } from "./http";
import type { DispatcherIdentity } from "./Dispatch";

const endpoint = "/api/crew";

export async function listCrew(): Promise<Crew[]> {
  try {
    return await requestJson<Crew[]>(endpoint);
  } catch {
    return mockData.crew.map((row) => ({ ...row }));
  }
}

export const switchCrewDuty = (
  crewId: number,
  version: number,
  dutyStatus: DutyStatus,
  dispatcher: DispatcherIdentity
): Promise<Crew> =>
  requestJson<Crew>(`${endpoint}/${crewId}/duty`, {
    method: "POST",
    body: { crewId, version, dutyStatus },
    dispatcher
  });
