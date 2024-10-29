'use client'

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface LanguageStore {
    language: 'en' | 'es';
    setLanguage: (lang: 'en' | 'es') => void;
}

export const useLanguage = create<LanguageStore>()(
    persist(
        (set) => ({
            language: 'en',
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'language-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
