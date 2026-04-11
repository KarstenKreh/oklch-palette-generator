import { create } from 'zustand';

export type IconStyle = 'outlined' | 'filled' | 'duotone' | 'auto';
export type IconWeight = 'thin' | 'regular' | 'bold' | 'auto';
export type IconCorners = 'sharp' | 'rounded' | 'auto';

export interface SymbolState {
  preferredStyle: IconStyle;
  preferredWeight: IconWeight;
  preferredCorners: IconCorners;
  iconBaseSize: number;
  iconScale: number;
  snapTo4px: boolean;
  selectedSet: string | null;
  surfaceHex: string;
}

interface SymbolActions {
  setPreferredStyle: (v: IconStyle) => void;
  setPreferredWeight: (v: IconWeight) => void;
  setPreferredCorners: (v: IconCorners) => void;
  setIconBaseSize: (v: number) => void;
  setIconScale: (v: number) => void;
  setSnapTo4px: (v: boolean) => void;
  setSelectedSet: (v: string | null) => void;
  setSurfaceHex: (v: string) => void;
  setFullState: (state: Partial<SymbolState>) => void;
}

export const useSymbolStore = create<SymbolState & SymbolActions>((set) => ({
  preferredStyle: 'auto',
  preferredWeight: 'auto',
  preferredCorners: 'auto',
  iconBaseSize: 1,
  iconScale: 1.25,
  snapTo4px: true,
  selectedSet: null,
  surfaceHex: '#335A7F',

  setPreferredStyle: (v) => set({ preferredStyle: v }),
  setPreferredWeight: (v) => set({ preferredWeight: v }),
  setPreferredCorners: (v) => set({ preferredCorners: v }),
  setIconBaseSize: (v) => set({ iconBaseSize: v }),
  setIconScale: (v) => set({ iconScale: v }),
  setSnapTo4px: (v) => set({ snapTo4px: v }),
  setSelectedSet: (v) => set({ selectedSet: v }),
  setSurfaceHex: (v) => set({ surfaceHex: v }),
  setFullState: (state) => set(state),
}));
