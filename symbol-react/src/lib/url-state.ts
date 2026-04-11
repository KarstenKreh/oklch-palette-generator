import type { IconStyle, IconWeight, IconCorners } from '@/store/symbol-store';

/**
 * Compact URL encoding for symbol state.
 * Format: style,weight,corners,baseSize100,scale1000,setId
 * Example: a,a,a,125,1250,
 */

const STYLE_MAP: Record<string, IconStyle> = { a: 'auto', o: 'outlined', f: 'filled', d: 'duotone' };
const STYLE_REV: Record<IconStyle, string> = { auto: 'a', outlined: 'o', filled: 'f', duotone: 'd' };
const WEIGHT_MAP: Record<string, IconWeight> = { a: 'auto', t: 'thin', r: 'regular', b: 'bold' };
const WEIGHT_REV: Record<IconWeight, string> = { auto: 'a', thin: 't', regular: 'r', bold: 'b' };
const CORNERS_MAP: Record<string, IconCorners> = { a: 'auto', s: 'sharp', n: 'rounded' };
const CORNERS_REV: Record<IconCorners, string> = { auto: 'a', sharp: 's', rounded: 'n' };

export interface UrlState {
  preferredStyle: IconStyle;
  preferredWeight: IconWeight;
  preferredCorners: IconCorners;
  iconBaseSize: number;
  iconScale: number;
  snapTo4px: boolean;
  selectedSet: string | null;
}

export function encodeState(state: UrlState): string {
  return [
    STYLE_REV[state.preferredStyle],
    WEIGHT_REV[state.preferredWeight],
    CORNERS_REV[state.preferredCorners],
    Math.round(state.iconBaseSize * 100),
    Math.round(state.iconScale * 1000),
    state.snapTo4px ? '1' : '0',
    state.selectedSet || '',
  ].join(',');
}

export function decodeState(raw: string): UrlState | null {
  const parts = raw.split(',');
  if (parts.length < 6) return null;

  const style = STYLE_MAP[parts[0]];
  const weight = WEIGHT_MAP[parts[1]];
  const corners = CORNERS_MAP[parts[2]];
  const baseSize = parseInt(parts[3], 10) / 100;
  const scale = parseInt(parts[4], 10) / 1000;
  const snap = parts[5] !== '0';
  const setId = parts[6] || null;

  if (!style || !weight || !corners || isNaN(baseSize) || isNaN(scale)) {
    return null;
  }

  return {
    preferredStyle: style,
    preferredWeight: weight,
    preferredCorners: corners,
    iconBaseSize: Math.max(0.5, Math.min(3, baseSize)),
    iconScale: Math.max(1, Math.min(2, scale)),
    snapTo4px: snap,
    selectedSet: setId,
  };
}
