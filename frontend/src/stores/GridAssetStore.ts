import { defineStore } from "pinia";
import { listGridAsset } from "../api/GridAsset";
import type { GridAsset } from "../types/GridAsset";

export const useGridAssetStore = defineStore("gridAsset", {
  state: () => ({ rows: [] as GridAsset[], loading: false }),
  getters: {
    byId(state) {
      return (id: number) => state.rows.find((asset) => asset.id === id);
    }
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listGridAsset();
      } finally {
        this.loading = false;
      }
    },
    upsert(row: GridAsset) {
      const index = this.rows.findIndex((item) => item.id === row.id);
      if (index >= 0) this.rows.splice(index, 1, row);
      else this.rows.push(row);
    }
  }
});
