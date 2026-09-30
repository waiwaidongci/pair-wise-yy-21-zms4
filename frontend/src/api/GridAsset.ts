import { request } from "./request";
import type { GridAsset } from "../types/GridAsset";

const endpoint = "/api/grid-asset";

export const listGridAsset = () => request<GridAsset[]>(endpoint);

export const saveGridAsset = (payload: Partial<GridAsset>) =>
  request<GridAsset>(endpoint, { method: "POST", body: payload });
