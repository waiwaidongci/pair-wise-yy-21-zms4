import { mockData } from "../mocks/seedData";
import type { SparePartUsage } from "../types/SparePartUsage";
import { requestJson } from "./http";

const endpoint = "/api/spare-part-usage";

export async function listSparePartUsage(): Promise<SparePartUsage[]> {
  try {
    return await requestJson<SparePartUsage[]>(endpoint);
  } catch {
    return mockData.sparePartUsage.map((row) => ({ ...row }));
  }
}

export const listSparePartUsageByTicket = async (ticketId: number): Promise<SparePartUsage[]> => {
  try {
    return await requestJson<SparePartUsage[]>(`${endpoint}/ticket/${ticketId}`);
  } catch {
    return mockData.sparePartUsage.filter((row) => row.ticket_id === ticketId).map((row) => ({ ...row }));
  }
};
