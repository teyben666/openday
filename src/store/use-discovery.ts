import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DiscoveryResult } from '@/lib/course-matching';

interface ShortlistStore {
  ids: string[];
  toggle: (id: string) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  isInShortlist: (id: string) => boolean;
}

export const useShortlist = create<ShortlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const { ids } = get();
        if (ids.includes(id)) set({ ids: ids.filter((i) => i !== id) });
        else set({ ids: [...ids, id] });
      },
      add: (id) => {
        if (!get().ids.includes(id)) set({ ids: [...get().ids, id] });
      },
      remove: (id) => set({ ids: get().ids.filter((i) => i !== id) }),
      clear: () => set({ ids: [] }),
      isInShortlist: (id) => get().ids.includes(id),
    }),
    { name: 'neuc-shortlist' },
  ),
);

export interface LeadInfo {
  name: string;
  email: string;
  phone: string;
}

interface DiscoveryStore {
  result: DiscoveryResult | null;
  answers: number[] | null;
  selectedProgramme: string | null;
  resultUnlocked: boolean;
  leadInfo: LeadInfo | null;
  unlockResult: (result: DiscoveryResult, answers: number[], lead: LeadInfo) => void;
  setPendingAnswers: (answers: number[]) => void;
  resetDiscovery: () => void;
  setSelectedProgramme: (id: string | null) => void;
}

export const useDiscovery = create<DiscoveryStore>()(
  persist(
    (set) => ({
      result: null,
      answers: null,
      selectedProgramme: null,
      resultUnlocked: false,
      leadInfo: null,
      setPendingAnswers: (answers) => set({ answers, result: null, resultUnlocked: false }),
      unlockResult: (result, answers, leadInfo) =>
        set({ result, answers, leadInfo, resultUnlocked: true }),
      resetDiscovery: () =>
        set({
          result: null,
          answers: null,
          resultUnlocked: false,
          leadInfo: null,
        }),
      setSelectedProgramme: (id) => set({ selectedProgramme: id }),
    }),
    { name: 'neuc-discovery' },
  ),
);
