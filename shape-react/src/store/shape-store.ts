import { create } from 'zustand';
import type { PaletteMode } from '@core/palette';
import type { ShapeStyle, ShadowType, ColorMode, SeparationMode } from '@core/url-state/shape';

export type { ShapeStyle, ShadowType, ColorMode, SeparationMode } from '@core/url-state/shape';

export interface ShapeState {
  // Style (top-level mode)
  shapeStyle: ShapeStyle;

  // Shadows (paper)
  shadowEnabled: boolean;
  shadowType: ShadowType;
  shadowStrength: number;
  shadowBlurScale: number;
  shadowScale: number;
  shadowColorMode: ColorMode;
  shadowCustomColor: string;

  // Borders
  borderEnabled: boolean;
  borderWidth: number;
  borderColorMode: ColorMode;
  borderCustomColor: string;

  // Border Radius
  borderRadius: number;

  // Glass (Liquid Glass via liquid-glass-react — active when shapeStyle === 'glass')
  glassDepth: number;
  glassBlur: number;
  glassDispersion: number;

  // Ring / Focus
  ringWidth: number;
  ringOffset: number;
  ringColorMode: ColorMode;
  ringCustomColor: string;

  // Surface Separation
  separationMode: SeparationMode;

  // Color parameters (read from color hash for preview accuracy)
  surfaceHex: string;
  paletteMode: PaletteMode;
  chromaScale: number;
  brandPin: boolean;

  // Setters
  setShapeStyle: (v: ShapeStyle) => void;
  setShadowEnabled: (v: boolean) => void;
  setShadowType: (v: ShadowType) => void;
  setShadowStrength: (v: number) => void;
  setShadowBlurScale: (v: number) => void;
  setShadowScale: (v: number) => void;
  setShadowColorMode: (v: ColorMode) => void;
  setShadowCustomColor: (v: string) => void;
  setBorderEnabled: (v: boolean) => void;
  setBorderWidth: (v: number) => void;
  setBorderColorMode: (v: ColorMode) => void;
  setBorderCustomColor: (v: string) => void;
  setBorderRadius: (v: number) => void;
  setGlassDepth: (v: number) => void;
  setGlassBlur: (v: number) => void;
  setGlassDispersion: (v: number) => void;
  setRingWidth: (v: number) => void;
  setRingOffset: (v: number) => void;
  setRingColorMode: (v: ColorMode) => void;
  setRingCustomColor: (v: string) => void;
  setSeparationMode: (v: SeparationMode) => void;
  setSurfaceHex: (v: string) => void;
  setPaletteMode: (v: PaletteMode) => void;
  setChromaScale: (v: number) => void;
  setBrandPin: (v: boolean) => void;
  setFullState: (state: Partial<ShapeState>) => void;
}

export const useShapeStore = create<ShapeState>((set) => ({
  // Style
  shapeStyle: 'paper',

  // Shadows
  shadowEnabled: true,
  shadowType: 'normal',
  shadowStrength: 1.0,
  shadowBlurScale: 1.0,
  shadowScale: 1.272,
  shadowColorMode: 'auto',
  shadowCustomColor: '#000000',

  // Borders
  borderEnabled: true,
  borderWidth: 1,
  borderColorMode: 'auto',
  borderCustomColor: '#000000',

  // Border Radius
  borderRadius: 8,

  // Glass
  glassDepth: 0.2,
  glassBlur: 2.0,
  glassDispersion: 0.5,

  // Ring
  ringWidth: 2,
  ringOffset: 2,
  ringColorMode: 'auto',
  ringCustomColor: '#000000',

  // Separation
  separationMode: 'shadow',

  // Color parameters
  surfaceHex: '#335A7F',
  paletteMode: 'balanced' as PaletteMode,
  chromaScale: 1.0,
  brandPin: false,

  // Setters
  setShapeStyle: (v) => set((prev) => v === 'neomorph' && prev.shapeStyle !== 'neomorph'
    ? { shapeStyle: v, borderWidth: 0, ringWidth: 3, ringOffset: 0 }
    : { shapeStyle: v }),
  setShadowEnabled: (v) => set({ shadowEnabled: v }),
  setShadowType: (v) => set({ shadowType: v }),
  setShadowStrength: (v) => set({ shadowStrength: v }),
  setShadowBlurScale: (v) => set({ shadowBlurScale: v }),
  setShadowScale: (v) => set({ shadowScale: v }),
  setShadowColorMode: (v) => set({ shadowColorMode: v }),
  setShadowCustomColor: (v) => set({ shadowCustomColor: v }),
  setBorderEnabled: (v) => set({ borderEnabled: v }),
  setBorderWidth: (v) => set({ borderWidth: v }),
  setBorderColorMode: (v) => set({ borderColorMode: v }),
  setBorderCustomColor: (v) => set({ borderCustomColor: v }),
  setBorderRadius: (v) => set({ borderRadius: v }),
  setGlassDepth: (v) => set({ glassDepth: v }),
  setGlassBlur: (v) => set({ glassBlur: v }),
  setGlassDispersion: (v) => set({ glassDispersion: v }),
  setRingWidth: (v) => set({ ringWidth: v }),
  setRingOffset: (v) => set({ ringOffset: v }),
  setRingColorMode: (v) => set({ ringColorMode: v }),
  setRingCustomColor: (v) => set({ ringCustomColor: v }),
  setSeparationMode: (v) => set({ separationMode: v }),
  setSurfaceHex: (v) => set({ surfaceHex: v }),
  setPaletteMode: (v) => set({ paletteMode: v }),
  setChromaScale: (v) => set({ chromaScale: v }),
  setBrandPin: (v) => set({ brandPin: v }),
  setFullState: (partial) => set(partial),
}));
