import { create } from 'zustand';

type Lang = 'zh' | 'en';

interface LanguageStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (zh: string, en: string) => string;
}

export const useLanguage = create<LanguageStore>((set, get) => ({
  lang: 'zh',
  setLang: (lang) => set({ lang }),
  toggleLang: () => set((state) => ({ lang: state.lang === 'zh' ? 'en' : 'zh' })),
  t: (zh: string, en: string) => get().lang === 'zh' ? zh : en,
}));

export type { Lang };
