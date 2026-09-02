import { create } from 'zustand';

interface ComparisonStore {
  selectedIds: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
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
}));
