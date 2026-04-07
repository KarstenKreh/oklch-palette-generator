import { create } from 'zustand';
import type { PaletteMode } from '@/lib/palette';
import { SUCCESS_HUE, WARNING_HUE, INFO_HUE, computeAutoAccentHex, computeAutoErrorHex } from '@/lib/palette';

export interface Accent {
  name: string;
  hex: string;
  pin: boolean;
  invert: boolean;
  autoMatch: boolean;
  autoHue: number;
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
  brandInvert: boolean;
  errorPin: boolean;
  errorInvert: boolean;
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
  toggleBrandInvert: () => void;
  toggleErrorPin: () => void;
  toggleErrorInvert: () => void;
  setFgContrastMode: (mode: FgContrastMode) => void;
  setThemeName: (name: string) => void;
  addAccent: () => void;
  removeAccent: (index: number) => void;
  updateAccent: (index: number, updates: Partial<Accent>) => void;
  toggleAccentPin: (index: number) => void;
  toggleAccentInvert: (index: number) => void;
  toggleAccentAutoMatch: (index: number) => void;
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
  brandInvert: false,
  errorPin: false,
  errorInvert: false,
  themeName: 'Standby.Design',
  fgContrastMode: 'best',

  setMode: (mode) => set({ currentMode: mode }),
  setChromaScale: (scale) => set({ chromaScale: scale }),
  setBrandHex: (hex) => set((s) => ({
    brandHex: hex,
    ...(s.bgAutoMatch ? { bgColorHex: hex } : {}),
  })),
  setBgColorHex: (hex) => set({ bgColorHex: hex, bgAutoMatch: false }),
  toggleBgAutoMatch: () => set((s) => {
    const next = !s.bgAutoMatch;
    return { bgAutoMatch: next, ...(next ? { bgColorHex: s.brandHex } : {}) };
  }),
  setErrorColorHex: (hex) => set({ errorColorHex: hex }),
  toggleErrorAutoMatch: () => set((s) => {
    const next = !s.errorAutoMatch;
    if (!next) {
      return { errorAutoMatch: false, errorColorHex: computeAutoErrorHex(s.brandHex) };
    }
    return { errorAutoMatch: true };
  }),
  toggleBrandPin: () => set((s) => ({ brandPin: !s.brandPin, ...(!s.brandPin ? {} : { brandInvert: false }) })),
  toggleBrandInvert: () => set((s) => ({ brandInvert: !s.brandInvert })),
  toggleErrorPin: () => set((s) => ({ errorPin: !s.errorPin, ...(!s.errorPin ? {} : { errorInvert: false }) })),
  toggleErrorInvert: () => set((s) => ({ errorInvert: !s.errorInvert })),
  setFgContrastMode: (mode) => set({ fgContrastMode: mode }),
  setThemeName: (name) => set({ themeName: name }),
  addAccent: () => set((s) => {
    if (s.extraAccents.length >= 3) return s;
    const presets: Accent[] = [
      { name: 'Success', hex: '#33994D', pin: false, invert: false, autoMatch: true, autoHue: SUCCESS_HUE },
      { name: 'Warning', hex: '#998033', pin: false, invert: false, autoMatch: true, autoHue: WARNING_HUE },
      { name: 'Info', hex: '#3355CC', pin: false, invert: false, autoMatch: true, autoHue: INFO_HUE },
    ];
    const usedNames = new Set(s.extraAccents.map(a => a.name));
    const next = presets.find(p => !usedNames.has(p.name))
      ?? { name: `Extra ${s.extraAccents.length + 1}`, hex: '#7C3AED', pin: false, invert: false, autoMatch: false, autoHue: 0 };
    return { extraAccents: [...s.extraAccents, { ...next }] };
  }),
  removeAccent: (index) => set((s) => ({
    extraAccents: s.extraAccents.filter((_, i) => i !== index),
  })),
  updateAccent: (index, updates) => set((s) => ({
    extraAccents: s.extraAccents.map((a, i) => i === index ? { ...a, ...updates } : a),
  })),
  toggleAccentPin: (index) => set((s) => ({
    extraAccents: s.extraAccents.map((a, i) => i === index ? { ...a, pin: !a.pin, ...(!a.pin ? {} : { invert: false }) } : a),
  })),
  toggleAccentInvert: (index) => set((s) => ({
    extraAccents: s.extraAccents.map((a, i) => i === index ? { ...a, invert: !a.invert } : a),
  })),
  toggleAccentAutoMatch: (index) => set((s) => ({
    extraAccents: s.extraAccents.map((a, i) => {
      if (i !== index) return a;
      const next = !a.autoMatch;
      if (!next) {
        return { ...a, autoMatch: false, hex: computeAutoAccentHex(s.brandHex, a.autoHue) };
      }
      return { ...a, autoMatch: true };
    }),
  })),
  setFullState: (partial) => set(partial),
}));
