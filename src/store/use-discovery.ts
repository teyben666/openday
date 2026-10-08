import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DiscoveryResult } from '@/lib/course-matching';

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
