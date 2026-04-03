import { create } from 'zustand';
import type { TypeLevel } from '@/lib/scale';
import { DEFAULT_TRADITIONAL, DEFAULT_TRADITIONAL_MOBILE } from '@/lib/scale';

export type ScaleMode = 'golden' | 'traditional' | 'custom';
export type MobileRatioMode = 'auto' | 'custom';

interface TypeState {
  scaleMode: ScaleMode;
  baseSize: number;
  mobileBaseSize: number;
  customRatio: number;
  mobileRatioMode: MobileRatioMode;
  mobileRatio: number;
  autoShrink: number;
  traditionalAssignments: Record<TypeLevel, number>;
  traditionalMobileAssignments: Record<TypeLevel, number>;

  headingFont: string;
  headingWeight: number;
  weightCompensation: boolean;
  bodyFont: string;
  monoFont: string;

  lineHeightOverrides: Partial<Record<TypeLevel, number>>;
  letterSpacingOverrides: Partial<Record<TypeLevel, number>>;
  spacingBaseMultiplier: number;

  previewText: string;
  previewViewport: number;

  setScaleMode: (mode: ScaleMode) => void;
  setBaseSize: (size: number) => void;
  setMobileBaseSize: (size: number) => void;
  setCustomRatio: (ratio: number) => void;
  setMobileRatioMode: (mode: MobileRatioMode) => void;
  setMobileRatio: (ratio: number) => void;
  setAutoShrink: (pct: number) => void;
  setTraditionalAssignment: (level: TypeLevel, px: number) => void;
  setTraditionalMobileAssignment: (level: TypeLevel, px: number) => void;
  setHeadingFont: (slug: string) => void;
  setHeadingWeight: (w: number) => void;
  setWeightCompensation: (on: boolean) => void;
  setBodyFont: (slug: string) => void;
  setMonoFont: (slug: string) => void;
  setLineHeightOverride: (level: TypeLevel, value: number | null) => void;
  setLetterSpacingOverride: (level: TypeLevel, value: number | null) => void;
  setSpacingBaseMultiplier: (m: number) => void;
  resetTypographyDetails: () => void;
  setPreviewText: (text: string) => void;
  setPreviewViewport: (px: number) => void;
  setFullState: (state: Partial<TypeState>) => void;
}

export const useTypeStore = create<TypeState>((set) => ({
  scaleMode: 'custom',
  baseSize: 1.0,
  mobileBaseSize: 1.0,
  customRatio: 1.272,
  mobileRatioMode: 'auto',
  mobileRatio: 1.2,
  autoShrink: 25,
  traditionalAssignments: { ...DEFAULT_TRADITIONAL },
  traditionalMobileAssignments: { ...DEFAULT_TRADITIONAL_MOBILE },

  headingFont: 'satoshi',
  headingWeight: 500,
  weightCompensation: true,
  bodyFont: 'satoshi',
  monoFont: 'system-mono',

  lineHeightOverrides: {},
  letterSpacingOverrides: {},
  spacingBaseMultiplier: 1.0,

  previewText: '',
  previewViewport: 1920,

  setScaleMode: (mode) => set({ scaleMode: mode }),
  setBaseSize: (size) => set((s) => ({
    baseSize: size,
    mobileBaseSize: Math.min(s.mobileBaseSize, size),
  })),
  setMobileBaseSize: (size) => set((s) => ({
    mobileBaseSize: size,
    baseSize: Math.max(s.baseSize, size),
  })),
  setCustomRatio: (ratio) => set({ customRatio: ratio }),
  setMobileRatioMode: (mode) => set({ mobileRatioMode: mode }),
  setMobileRatio: (ratio) => set({ mobileRatio: ratio }),
  setAutoShrink: (pct) => set({ autoShrink: pct }),
  setTraditionalAssignment: (level, px) =>
    set((s) => ({
      traditionalAssignments: { ...s.traditionalAssignments, [level]: px },
    })),
  setTraditionalMobileAssignment: (level, px) =>
    set((s) => ({
      traditionalMobileAssignments: { ...s.traditionalMobileAssignments, [level]: px },
    })),
  setHeadingFont: (slug) => set({ headingFont: slug }),
  setHeadingWeight: (w) => set({ headingWeight: w }),
  setWeightCompensation: (on) => set({ weightCompensation: on }),
  setBodyFont: (slug) => set({ bodyFont: slug }),
  setMonoFont: (slug) => set({ monoFont: slug }),
  setLineHeightOverride: (level, value) =>
    set((s) => {
      const overrides = { ...s.lineHeightOverrides };
      if (value === null) { delete overrides[level]; } else { overrides[level] = value; }
      return { lineHeightOverrides: overrides };
    }),
  setLetterSpacingOverride: (level, value) =>
    set((s) => {
      const overrides = { ...s.letterSpacingOverrides };
      if (value === null) { delete overrides[level]; } else { overrides[level] = value; }
      return { letterSpacingOverrides: overrides };
    }),
  setSpacingBaseMultiplier: (m) => set({ spacingBaseMultiplier: m }),
  resetTypographyDetails: () => set({ lineHeightOverrides: {}, letterSpacingOverrides: {} }),
  setPreviewText: (text) => set({ previewText: text }),
  setPreviewViewport: (px) => set({ previewViewport: px }),
  setFullState: (partial) => set(partial),
}));
