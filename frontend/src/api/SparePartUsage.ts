import { request } from "./request";
import type { SparePartUsage } from "../types/SparePartUsage";

const endpoint = "/api/spare-part-usage";

export const listSparePartUsage = () => request<SparePartUsage[]>(endpoint);

export const saveSparePartUsage = (payload: Partial<SparePartUsage>) =>
  request<SparePartUsage>(endpoint, { method: "POST", body: payload });
