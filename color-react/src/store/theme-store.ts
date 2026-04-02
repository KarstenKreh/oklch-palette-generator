import { create } from 'zustand';
import type { PaletteMode } from '@/lib/palette';

export interface Accent {
  name: string;
  hex: string;
  pin: boolean;
}

export type FgContrastMode = 'best' | 'preferLight' | 'preferDark';

interface ThemeState {
  currentMode: PaletteMode;
  chromaScale: number;
  brandHex: string;
  bgColorHex: string;
  bgAutoMatch: boolean;
  errorColorHex: string;
  errorAutoMatch: boolean;
  extraAccents: Accent[];
  brandPin: boolean;
  errorPin: boolean;
  fgContrastMode: FgContrastMode;
  themeName: string;

  setMode: (mode: PaletteMode) => void;
  setChromaScale: (scale: number) => void;
  setBrandHex: (hex: string) => void;
  setBgColorHex: (hex: string) => void;
  toggleBgAutoMatch: () => void;
  setErrorColorHex: (hex: string) => void;
  toggleErrorAutoMatch: () => void;
  toggleBrandPin: () => void;
  toggleErrorPin: () => void;
  setFgContrastMode: (mode: FgContrastMode) => void;
  setThemeName: (name: string) => void;
  addAccent: () => void;
  removeAccent: (index: number) => void;
  updateAccent: (index: number, updates: Partial<Accent>) => void;
  toggleAccentPin: (index: number) => void;
  setFullState: (state: Partial<ThemeState>) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentMode: 'balanced',
  chromaScale: 0.25,
  brandHex: '#335A7F',
  bgColorHex: '#335A7F',
  bgAutoMatch: true,
  errorColorHex: '#CC3333',
  errorAutoMatch: true,
  extraAccents: [],
  brandPin: false,
  errorPin: false,
  themeName: 'Standby.Design',
  fgContrastMode: 'best',

  setMode: (mode) => set({ currentMode: mode }),
  setChromaScale: (scale) => set({ chromaScale: scale }),
  setBrandHex: (hex) => set((s) => ({
    brandHex: hex,
    ...(s.bgAutoMatch ? { bgColorHex: hex } : {}),
  })),
  setBgColorHex: (hex) => set({ bgColorHex: hex }),
  toggleBgAutoMatch: () => set((s) => {
    const next = !s.bgAutoMatch;
    return { bgAutoMatch: next, ...(next ? { bgColorHex: s.brandHex } : {}) };
  }),
  setErrorColorHex: (hex) => set({ errorColorHex: hex }),
  toggleErrorAutoMatch: () => set((s) => ({ errorAutoMatch: !s.errorAutoMatch })),
  toggleBrandPin: () => set((s) => ({ brandPin: !s.brandPin })),
  toggleErrorPin: () => set((s) => ({ errorPin: !s.errorPin })),
  setFgContrastMode: (mode) => set({ fgContrastMode: mode }),
  setThemeName: (name) => set({ themeName: name }),
  addAccent: () => set((s) => {
    if (s.extraAccents.length >= 3) return s;
    return { extraAccents: [...s.extraAccents, { name: `Extra ${s.extraAccents.length + 1}`, hex: '#7C3AED', pin: false }] };
  }),
  removeAccent: (index) => set((s) => ({
    extraAccents: s.extraAccents.filter((_, i) => i !== index),
  })),
  updateAccent: (index, updates) => set((s) => ({
    extraAccents: s.extraAccents.map((a, i) => i === index ? { ...a, ...updates } : a),
  })),
  toggleAccentPin: (index) => set((s) => ({
    extraAccents: s.extraAccents.map((a, i) => i === index ? { ...a, pin: !a.pin } : a),
  })),
  setFullState: (partial) => set(partial),
}));
