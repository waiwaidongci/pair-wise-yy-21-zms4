import { request } from "./request";
import type { FaultReport } from "../types/FaultReport";

const endpoint = "/api/fault-report";

export const listFaultReport = () => request<FaultReport[]>(endpoint);

export const saveFaultReport = (payload: Partial<FaultReport>) =>
  request<FaultReport>(endpoint, { method: "POST", body: payload });
