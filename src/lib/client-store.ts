import { create } from "zustand";
import { persist } from "zustand/middleware";

type ClientState = {
  compareIds: string[];
  recentlyViewed: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  setCompare: (ids: string[]) => void;
  pushViewed: (id: string) => void;
};

export const useClientStore = create<ClientState>()(
  persist(
    (set, get) => ({
      compareIds: [],
      recentlyViewed: [],
      toggleCompare: (id) => {
        const cur = get().compareIds;
        if (cur.includes(id)) {
          set({ compareIds: cur.filter((x) => x !== id) });
          return;
        }
        if (cur.length >= 4) return;
        set({ compareIds: [...cur, id] });
      },
      clearCompare: () => set({ compareIds: [] }),
      setCompare: (ids) => set({ compareIds: ids.slice(0, 4) }),
      pushViewed: (id) => {
        const next = [id, ...get().recentlyViewed.filter((x) => x !== id)].slice(0, 8);
        set({ recentlyViewed: next });
      },
    }),
    { name: "meridian-client" },
  ),
);
