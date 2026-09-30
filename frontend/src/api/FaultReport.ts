import { mockData } from "../mocks/seedData";
import type { FaultReport } from "../types/FaultReport";
import { requestJson } from "./http";

const endpoint = "/api/fault-report";

export async function listFaultReport(): Promise<FaultReport[]> {
  try {
    return await requestJson<FaultReport[]>(endpoint);
  } catch {
    return mockData.faultReport.map((row) => ({ ...row }));
  }
}
