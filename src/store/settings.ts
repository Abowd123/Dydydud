import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'system';
export type Lang = 'ar' | 'en';

interface SettingsState {
  theme: Theme;
  lang: Lang;
  onboarded: boolean;
  sound: boolean;
  vibrate: boolean;
  warmup: boolean;
  cloudPhotos: boolean;
  smartReschedule: boolean;
  /** الكاميرا: إرشاد صوتي أثناء فحص الأداء */
  formVoice: boolean;
  ramadan: boolean;
  homeMode: string | null; // تاريخ اليوم لو مفعّل
  setRamadan: (v: boolean) => void;
  setHomeMode: (date: string | null) => void;
  reminders: { workoutTime: string | null; waterEveryH: number | null; waterStart: number; waterEnd: number };
  setReminders: (r: Partial<SettingsState['reminders']>) => void;
  setTheme: (t: Theme) => void;
  setLang: (l: Lang) => void;
  setOnboarded: (v: boolean) => void;
  setPref: (k: 'sound' | 'vibrate' | 'warmup' | 'cloudPhotos' | 'smartReschedule' | 'formVoice', v: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      lang: 'ar',
      onboarded: false,
      sound: true,
      vibrate: true,
      warmup: true,
      cloudPhotos: false,
      smartReschedule: true,
      formVoice: true,
      ramadan: false,
      homeMode: null,
      setRamadan: (ramadan) => set({ ramadan }),
      setHomeMode: (homeMode) => set({ homeMode }),
      reminders: { workoutTime: null, waterEveryH: null, waterStart: 9, waterEnd: 21 },
      setReminders: (r) => set((st) => ({ reminders: { ...st.reminders, ...r } })),
      setTheme: (theme) => set({ theme }),
      setLang: (lang) => set({ lang }),
      setOnboarded: (onboarded) => set({ onboarded }),
      setPref: (k, v) => set({ [k]: v } as Pick<SettingsState, typeof k>)
    }),
    { name: 'gymmate-settings' }
  )
);
