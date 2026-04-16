import { create } from 'zustand';
import type { SpacingMode } from '@core/spacing';
import type { Breakpoint, Container } from '@core/layout';
import type { AspectRatio } from '@core/aspect';
import { DEFAULT_SPACE_URL_STATE } from '@core/url-state/space';

export type SpaceSection = 'spacing' | 'breakpoints' | 'containers' | 'aspect';

export interface SpaceState {
  // Spacing
  spacingMode: SpacingMode;
  spacingBaseRem: number;
  spacingRatio: number;
  spacingMultiplier: number;
  spacingSnap: boolean;

  // Breakpoints
  breakpoints: Breakpoint[];
  fluidMinVw: number;
  fluidMaxVw: number;

  // Containers
  containers: Container[];
  proseMaxCh: number;

  // Aspect Ratios
  aspectRatios: AspectRatio[];
  aspectIncludeReciprocals: boolean;

  // UI
  activeSection: SpaceSection;

  // Setters — spacing
  setSpacingMode: (v: SpacingMode) => void;
  setSpacingBaseRem: (v: number) => void;
  setSpacingRatio: (v: number) => void;
  setSpacingMultiplier: (v: number) => void;
  setSpacingSnap: (v: boolean) => void;

  // Setters — breakpoints
  setBreakpoint: (name: string, minPx: number) => void;
  renameBreakpoint: (oldName: string, newName: string) => void;
  addBreakpoint: (bp: Breakpoint) => void;
  removeBreakpoint: (name: string) => void;
  setFluidMinVw: (v: number) => void;
  setFluidMaxVw: (v: number) => void;

  // Setters — containers
  setContainer: (name: string, maxPx: number) => void;
  renameContainer: (oldName: string, newName: string) => void;
  addContainer: (c: Container) => void;
  removeContainer: (name: string) => void;
  setProseMaxCh: (v: number) => void;

  // Setters — aspect ratios
  setAspectRatio: (name: string, w: number, h: number) => void;
  renameAspectRatio: (oldName: string, newName: string) => void;
  addAspectRatio: (a: AspectRatio) => void;
  removeAspectRatio: (name: string) => void;
  setAspectIncludeReciprocals: (v: boolean) => void;

  // UI
  setActiveSection: (v: SpaceSection) => void;

  // Batch
  resetAll: () => void;
  setFullState: (partial: Partial<SpaceState>) => void;
}

const d = DEFAULT_SPACE_URL_STATE;

export const useSpaceStore = create<SpaceState>((set) => ({
  spacingMode: d.spacingMode,
  spacingBaseRem: d.spacingBaseRem,
  spacingRatio: d.spacingRatio,
  spacingMultiplier: d.spacingMultiplier,
  spacingSnap: d.spacingSnap,

  breakpoints: [...d.breakpoints],
  fluidMinVw: d.fluidMinVw,
  fluidMaxVw: d.fluidMaxVw,

  containers: [...d.containers],
  proseMaxCh: d.proseMaxCh,

  aspectRatios: [...d.aspectRatios],
  aspectIncludeReciprocals: d.aspectIncludeReciprocals,

  activeSection: 'spacing',

  setSpacingMode: (v) => set({ spacingMode: v }),
  setSpacingBaseRem: (v) => set({ spacingBaseRem: v }),
  setSpacingRatio: (v) => set({ spacingRatio: v }),
  setSpacingMultiplier: (v) => set({ spacingMultiplier: v }),
  setSpacingSnap: (v) => set({ spacingSnap: v }),

  setBreakpoint: (name, minPx) => set((s) => ({
    breakpoints: s.breakpoints.map((b) => (b.name === name ? { name, minPx } : b)),
  })),
  renameBreakpoint: (oldName, newName) => set((s) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return s;
    if (s.breakpoints.some((b) => b.name === trimmed)) return s;
    return {
      breakpoints: s.breakpoints.map((b) => (b.name === oldName ? { ...b, name: trimmed } : b)),
    };
  }),
  addBreakpoint: (bp) => set((s) => ({ breakpoints: [...s.breakpoints, bp] })),
  removeBreakpoint: (name) => set((s) => ({
    breakpoints: s.breakpoints.filter((b) => b.name !== name),
  })),
  setFluidMinVw: (v) => set({ fluidMinVw: v }),
  setFluidMaxVw: (v) => set({ fluidMaxVw: v }),

  setContainer: (name, maxPx) => set((s) => ({
    containers: s.containers.map((c) => (c.name === name ? { name, maxPx } : c)),
  })),
  renameContainer: (oldName, newName) => set((s) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return s;
    if (s.containers.some((c) => c.name === trimmed)) return s;
    return {
      containers: s.containers.map((c) => (c.name === oldName ? { ...c, name: trimmed } : c)),
    };
  }),
  addContainer: (c) => set((s) => ({ containers: [...s.containers, c] })),
  removeContainer: (name) => set((s) => ({
    containers: s.containers.filter((c) => c.name !== name),
  })),
  setProseMaxCh: (v) => set({ proseMaxCh: v }),

  setAspectRatio: (name, w, h) => set((s) => ({
    aspectRatios: s.aspectRatios.map((a) => (a.name === name ? { name, w, h } : a)),
  })),
  renameAspectRatio: (oldName, newName) => set((s) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return s;
    if (s.aspectRatios.some((a) => a.name === trimmed)) return s;
    return {
      aspectRatios: s.aspectRatios.map((a) => (a.name === oldName ? { ...a, name: trimmed } : a)),
    };
  }),
  addAspectRatio: (a) => set((s) => ({ aspectRatios: [...s.aspectRatios, a] })),
  removeAspectRatio: (name) => set((s) => ({
    aspectRatios: s.aspectRatios.filter((a) => a.name !== name),
  })),
  setAspectIncludeReciprocals: (v) => set({ aspectIncludeReciprocals: v }),

  setActiveSection: (v) => set({ activeSection: v }),

  resetAll: () => set({
    spacingMode: d.spacingMode,
    spacingBaseRem: d.spacingBaseRem,
    spacingRatio: d.spacingRatio,
    spacingMultiplier: d.spacingMultiplier,
    spacingSnap: d.spacingSnap,
    breakpoints: [...d.breakpoints],
    fluidMinVw: d.fluidMinVw,
    fluidMaxVw: d.fluidMaxVw,
    containers: [...d.containers],
    proseMaxCh: d.proseMaxCh,
    aspectRatios: [...d.aspectRatios],
    aspectIncludeReciprocals: d.aspectIncludeReciprocals,
  }),
  setFullState: (partial) => set(partial),
}));
