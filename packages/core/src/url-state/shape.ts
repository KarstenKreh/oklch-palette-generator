// URL state serialization for the Shape tool — pure functions, no DOM access.
// Shared between shape-react and system-react.

export type ShapeStyle = 'paper' | 'glass' | 'neomorph' | 'neobrutalism';
export type ShadowType = 'normal' | 'flat';
export type BrutalistVariant = 'outlined' | 'solid';
export type ColorMode = 'auto' | 'custom';
export type SeparationMode = 'shadow' | 'border' | 'contrast' | 'gap' | 'mixed';

/** The subset of Shape state that is encoded in the URL hash. */
export interface ShapeUrlState {
  shapeStyle: ShapeStyle;
  shadowEnabled: boolean;
  shadowType: ShadowType;
  shadowStrength: number;
  shadowBlurScale: number;
  shadowScale: number;
  shadowColorMode: ColorMode;
  shadowCustomColor: string;
  borderEnabled: boolean;
  borderWidth: number;
  borderColorMode: ColorMode;
  borderCustomColor: string;
  borderRadius: number;
  glassDepth: number;
  glassBlur: number;
  glassDispersion: number;
  ringWidth: number;
  ringOffset: number;
  ringColorMode: ColorMode;
  ringCustomColor: string;
  separationMode: SeparationMode;
  shadowOffsetX: number;
  shadowOffsetY: number;
  brutalistVariant: BrutalistVariant;
}

/**
 * Encode shape state into a compact comma-separated string.
 *
 * Format (21 parts): shapeStyle,
 *         shadowEnabled,shadowType,strength,blurScale,scale,shadowColorMode,shadowCustomHex,
 *         borderEnabled,borderWidth,borderColorMode,borderCustomHex,
 *         borderRadius,
 *         glassDepth,glassBlur,glassDispersion,
 *         ringWidth,ringOffset,ringColorMode,ringCustomHex,
 *         separationMode,
 *         shadowOffsetX,shadowOffsetY,brutalistVariant
 */
export function encodeState(s: ShapeUrlState): string {
  return [
    s.shapeStyle,
    s.shadowEnabled ? 1 : 0,
    s.shadowType,
    Math.round(s.shadowStrength * 100),
    Math.round(s.shadowBlurScale * 100),
    Math.round(s.shadowScale * 1000),
    s.shadowColorMode === 'auto' ? 'a' : 'c',
    s.shadowColorMode === 'custom' ? s.shadowCustomColor.replace('#', '') : '',
    s.borderEnabled ? 1 : 0,
    Math.round(s.borderWidth * 10),
    s.borderColorMode === 'auto' ? 'a' : 'c',
    s.borderColorMode === 'custom' ? s.borderCustomColor.replace('#', '') : '',
    s.borderRadius,
    Math.round(s.glassDepth * 10),
    Math.round(s.glassBlur * 10),
    Math.round(s.glassDispersion * 10),
    s.ringWidth,
    s.ringOffset,
    s.ringColorMode === 'auto' ? 'a' : 'c',
    s.ringColorMode === 'custom' ? s.ringCustomColor.replace('#', '') : '',
    s.separationMode,
    s.shadowOffsetX,
    s.shadowOffsetY,
    s.brutalistVariant === 'solid' ? 's' : 'o',
  ].join(',');
}

const SHAPE_STYLES = new Set(['paper', 'glass', 'neomorph', 'neobrutalism']);
const SHADOW_TYPES = new Set(['normal', 'flat']);
const SEPARATION_MODES = new Set(['shadow', 'border', 'contrast', 'gap', 'mixed']);

export function decodeState(raw: string): Partial<ShapeUrlState> | null {
  const parts = raw.split(',');
  if (parts.length < 20) return null;

  // Detect legacy 20-field format: parts[0] is '0' or '1' (shadowEnabled), not a style name
  const isLegacy = parts[0] === '0' || parts[0] === '1';
  if (isLegacy) {
    parts.unshift('paper');
  }

  if (parts.length < 21) return null;

  const result: Partial<ShapeUrlState> = {};

  if (SHAPE_STYLES.has(parts[0])) result.shapeStyle = parts[0] as ShapeStyle;

  if (parts[1] === '0' || parts[1] === '1') result.shadowEnabled = parts[1] === '1';
  if (parts[2] === 'neumorphic') {
    // Legacy: shadowType='neumorphic' was the Paper sub-mode; promote to top-level neomorph.
    result.shapeStyle = 'neomorph';
    result.shadowType = 'normal';
  } else if (SHADOW_TYPES.has(parts[2])) {
    result.shadowType = parts[2] as ShadowType;
  }
  const strength = parseInt(parts[3]);
  if (!isNaN(strength)) result.shadowStrength = strength / 100;
  const blur = parseInt(parts[4]);
  if (!isNaN(blur)) result.shadowBlurScale = blur / 100;
  const scale = parseInt(parts[5]);
  if (!isNaN(scale)) result.shadowScale = scale / 1000;
  result.shadowColorMode = parts[6] === 'c' ? 'custom' : 'auto' as ColorMode;
  if (parts[7] && /^[0-9a-fA-F]{6}$/.test(parts[7])) result.shadowCustomColor = '#' + parts[7];

  if (parts[8] === '0' || parts[8] === '1') result.borderEnabled = parts[8] === '1';
  const bw = parseInt(parts[9]);
  if (!isNaN(bw)) result.borderWidth = bw / 10;
  result.borderColorMode = parts[10] === 'c' ? 'custom' : 'auto' as ColorMode;
  if (parts[11] && /^[0-9a-fA-F]{6}$/.test(parts[11])) result.borderCustomColor = '#' + parts[11];

  const radius = parseInt(parts[12]);
  if (!isNaN(radius)) result.borderRadius = radius;

  const gDepth = parseInt(parts[13]);
  if (!isNaN(gDepth)) result.glassDepth = gDepth / 10;
  const gBlur = parseInt(parts[14]);
  if (!isNaN(gBlur)) result.glassBlur = gBlur / 10;
  const gDisp = parseInt(parts[15]);
  if (!isNaN(gDisp)) result.glassDispersion = gDisp / 10;

  const rw = parseInt(parts[16]);
  if (!isNaN(rw)) result.ringWidth = rw;
  const ro = parseInt(parts[17]);
  if (!isNaN(ro)) result.ringOffset = ro;
  result.ringColorMode = parts[18] === 'c' ? 'custom' : 'auto' as ColorMode;
  if (parts[19] && /^[0-9a-fA-F]{6}$/.test(parts[19])) result.ringCustomColor = '#' + parts[19];

  if (SEPARATION_MODES.has(parts[20])) result.separationMode = parts[20] as SeparationMode;

  // Backward-compatible brutalism fields (added after initial 21-field format).
  const oX = parseInt(parts[21]);
  if (!isNaN(oX)) result.shadowOffsetX = oX;
  const oY = parseInt(parts[22]);
  if (!isNaN(oY)) result.shadowOffsetY = oY;
  if (parts[23] === 's' || parts[23] === 'o') {
    result.brutalistVariant = parts[23] === 's' ? 'solid' : 'outlined';
  }

  return result;
}
