/**
 * Decode-only symbol URL state for the system app (read-only viewer).
 */

export type IconStyle = 'outlined' | 'filled' | 'duotone' | 'auto';
export type IconWeight = 'thin' | 'regular' | 'bold' | 'auto';
export type IconCorners = 'sharp' | 'rounded' | 'auto';

export interface SymbolState {
  preferredStyle: IconStyle;
  preferredWeight: IconWeight;
  preferredCorners: IconCorners;
  iconBaseSize: number;
  iconScale: number;
  selectedSet: string | null;
}

const STYLE_MAP: Record<string, IconStyle> = { a: 'auto', o: 'outlined', f: 'filled', d: 'duotone' };
const WEIGHT_MAP: Record<string, IconWeight> = { a: 'auto', t: 'thin', r: 'regular', b: 'bold' };
const CORNERS_MAP: Record<string, IconCorners> = { a: 'auto', s: 'sharp', n: 'rounded' };

export function decodeState(raw: string): SymbolState | null {
  const parts = raw.split(',');
  if (parts.length < 6) return null;

  const style = STYLE_MAP[parts[0]];
  const weight = WEIGHT_MAP[parts[1]];
  const corners = CORNERS_MAP[parts[2]];
  const baseSize = parseInt(parts[3], 10) / 100;
  const scale = parseInt(parts[4], 10) / 1000;
  // parts[5] = snapTo4px (skipped — not relevant for export)
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
    selectedSet: setId,
  };
}
