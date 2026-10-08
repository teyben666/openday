import { create } from 'zustand';

interface ComparisonStore {
  selectedIds: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  /** Swap two courses by index in the compare list. */
  swap: (i: number, j: number) => void;
  /** Move course at `from` to index `to`. */
  move: (from: number, to: number) => void;
}

export const useComparison = create<ComparisonStore>((set, get) => ({
  selectedIds: [],
  add: (id) => set((s) => ({ selectedIds: [...s.selectedIds, id] })),
  remove: (id) => set((s) => ({ selectedIds: s.selectedIds.filter((i) => i !== id) })),
  toggle: (id) => {
    const { selectedIds } = get();
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter((i) => i !== id) });
    } else if (selectedIds.length < 3) {
      set({ selectedIds: [...selectedIds, id] });
    }
  },
  clear: () => set({ selectedIds: [] }),
  isSelected: (id) => get().selectedIds.includes(id),
  swap: (i, j) => {
    const ids = [...get().selectedIds];
    if (i < 0 || j < 0 || i >= ids.length || j >= ids.length || i === j) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    set({ selectedIds: ids });
  },
  move: (from, to) => {
    const ids = [...get().selectedIds];
    if (from < 0 || to < 0 || from >= ids.length || to >= ids.length || from === to) return;
    const [item] = ids.splice(from, 1);
    ids.splice(to, 0, item);
    set({ selectedIds: ids });
  },
}));
