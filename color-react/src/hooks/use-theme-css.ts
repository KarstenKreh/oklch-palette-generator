import { useEffect } from 'react';
import type { PaletteEntry } from '@core/palette';

export function useThemeCss(
  brand: PaletteEntry[],
  slated: PaletteEntry[],
  neutral: PaletteEntry[]
) {
  useEffect(() => {
    const root = document.documentElement;
    const b: Record<number, PaletteEntry> = {};
    brand.forEach(r => b[r.step] = r);
    const s: Record<number, PaletteEntry> = {};
    slated.forEach(r => s[r.step] = r);
    const n: Record<number, PaletteEntry> = {};
    neutral.forEach(r => n[r.step] = r);

    const set = (k: string, v: string) => root.style.setProperty(k, v);

    // Page chrome theme variables
    set('--bg-page', s[900]?.hex || '#0e0e14');
    set('--bg-surface', s[875]?.hex || '#16162a');
    set('--border-color', s[700]?.hex || '#2a2a3a');
    set('--border-hi', s[800]?.hex || '#1e1e30');
    set('--text-hi', s[75]?.hex || '#e0e0e0');
    set('--text-mid', s[300]?.hex || '#aaa');
    set('--text-dim', s[500]?.hex || '#777');
    set('--text-faint', s[600]?.hex || '#555');
    set('--accent-color', b[500]?.hex || '#4a7aaa');
    set('--accent-text', b[400]?.hex || '#8cb4ff');
    set('--accent-bg', `${b[600]?.hex || '#335577'}33`);
  }, [brand, slated, neutral]);
}
