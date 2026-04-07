import { create } from 'zustand';

export type ShadowType = 'normal' | 'neumorphic' | 'flat';
export type ColorMode = 'auto' | 'custom';
export type SeparationMode = 'shadow' | 'border' | 'contrast' | 'gap' | 'mixed';

export interface ShapeState {
  // Shadows
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

  // Backdrop Blur / Glass
  glassEnabled: boolean;
  glassBlur: number;
  glassOpacity: number;

  // Ring / Focus
  ringWidth: number;
  ringOffset: number;
  ringColorMode: ColorMode;
  ringCustomColor: string;

  // Surface Separation
  separationMode: SeparationMode;

  // Surface color for previews (overridden from color hash)
  surfaceHex: string;

  // Setters
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
  setGlassEnabled: (v: boolean) => void;
  setGlassBlur: (v: number) => void;
  setGlassOpacity: (v: number) => void;
  setRingWidth: (v: number) => void;
  setRingOffset: (v: number) => void;
  setRingColorMode: (v: ColorMode) => void;
  setRingCustomColor: (v: string) => void;
  setSeparationMode: (v: SeparationMode) => void;
  setSurfaceHex: (v: string) => void;
  setFullState: (state: Partial<ShapeState>) => void;
}

export const useShapeStore = create<ShapeState>((set) => ({
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
  glassEnabled: false,
  glassBlur: 12,
  glassOpacity: 0.8,

  // Ring
  ringWidth: 2,
  ringOffset: 2,
  ringColorMode: 'auto',
  ringCustomColor: '#000000',

  // Separation
  separationMode: 'shadow',

  // Surface
  surfaceHex: '#335A7F',

  // Setters
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
  setGlassEnabled: (v) => set({ glassEnabled: v }),
  setGlassBlur: (v) => set({ glassBlur: v }),
  setGlassOpacity: (v) => set({ glassOpacity: v }),
  setRingWidth: (v) => set({ ringWidth: v }),
  setRingOffset: (v) => set({ ringOffset: v }),
  setRingColorMode: (v) => set({ ringColorMode: v }),
  setRingCustomColor: (v) => set({ ringCustomColor: v }),
  setSeparationMode: (v) => set({ separationMode: v }),
  setSurfaceHex: (v) => set({ surfaceHex: v }),
  setFullState: (partial) => set(partial),
}));
