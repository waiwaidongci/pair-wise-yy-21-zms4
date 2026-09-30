import { mockData } from "../mocks/seedData";
import type { RepairTicket } from "../types/RepairTicket";
import { requestJson } from "./http";

const endpoint = "/api/repair-ticket";

export async function listRepairTicket(): Promise<RepairTicket[]> {
  try {
    return await requestJson<RepairTicket[]>(endpoint);
  } catch {
    // 后端离线时降级到本地静态台账（派工写操作不降级）。
    return mockData.repairTicket.map((row) => ({ ...row }));
  }
}
