import { mockData } from "../mocks/seedData";
import type { GridAsset } from "../types/GridAsset";
import { requestJson } from "./http";

const endpoint = "/api/grid-asset";

export async function listGridAsset(): Promise<GridAsset[]> {
  try {
    return await requestJson<GridAsset[]>(endpoint);
  } catch {
    return mockData.gridAsset.map((row) => ({ ...row }));
  }
}
