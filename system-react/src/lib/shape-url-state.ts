// Types inlined to avoid dependency on shape-react's store
export type ShapeStyle = 'paper' | 'glass';
export type ShadowType = 'normal' | 'neumorphic' | 'flat';
export type ColorMode = 'auto' | 'custom';
export type SeparationMode = 'shadow' | 'border' | 'contrast' | 'gap' | 'mixed';

export interface ShapeState {
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
}

/**
 * Decode shape state from compact comma-separated string.
 *
 * Format (21 parts): shapeStyle,
 *         shadowEnabled,shadowType,strength,blurScale,scale,shadowColorMode,shadowCustomHex,
 *         borderEnabled,borderWidth,borderColorMode,borderCustomHex,
 *         borderRadius,
 *         glassDepth,glassBlur,glassDispersion,
 *         ringWidth,ringOffset,ringColorMode,ringCustomHex,
 *         separationMode
 */

const SHAPE_STYLES = new Set(['paper', 'glass']);
const SHADOW_TYPES = new Set(['normal', 'neumorphic', 'flat']);
const SEPARATION_MODES = new Set(['shadow', 'border', 'contrast', 'gap', 'mixed']);

export function decodeState(raw: string): Partial<ShapeState> | null {
  const parts = raw.split(',');
  if (parts.length < 21) return null;

  const result: Partial<ShapeState> = {};

  // Style
  if (SHAPE_STYLES.has(parts[0])) result.shapeStyle = parts[0] as ShapeStyle;

  // Shadow
  if (parts[1] === '0' || parts[1] === '1') result.shadowEnabled = parts[1] === '1';
  if (SHADOW_TYPES.has(parts[2])) result.shadowType = parts[2] as ShadowType;
  const strength = parseInt(parts[3]);
  if (!isNaN(strength)) result.shadowStrength = strength / 100;
  const blur = parseInt(parts[4]);
  if (!isNaN(blur)) result.shadowBlurScale = blur / 100;
  const scale = parseInt(parts[5]);
  if (!isNaN(scale)) result.shadowScale = scale / 1000;
  result.shadowColorMode = parts[6] === 'c' ? 'custom' : 'auto' as ColorMode;
  if (parts[7] && /^[0-9a-fA-F]{6}$/.test(parts[7])) result.shadowCustomColor = '#' + parts[7];

  // Border
  if (parts[8] === '0' || parts[8] === '1') result.borderEnabled = parts[8] === '1';
  const bw = parseInt(parts[9]);
  if (!isNaN(bw)) result.borderWidth = bw / 10;
  result.borderColorMode = parts[10] === 'c' ? 'custom' : 'auto' as ColorMode;
  if (parts[11] && /^[0-9a-fA-F]{6}$/.test(parts[11])) result.borderCustomColor = '#' + parts[11];

  // Radius
  const radius = parseInt(parts[12]);
  if (!isNaN(radius)) result.borderRadius = radius;

  // Glass
  const gDepth = parseInt(parts[13]);
  if (!isNaN(gDepth)) result.glassDepth = gDepth / 10;
  const gBlur = parseInt(parts[14]);
  if (!isNaN(gBlur)) result.glassBlur = gBlur / 10;
  const gDisp = parseInt(parts[15]);
  if (!isNaN(gDisp)) result.glassDispersion = gDisp / 10;

  // Ring
  const rw = parseInt(parts[16]);
  if (!isNaN(rw)) result.ringWidth = rw;
  const ro = parseInt(parts[17]);
  if (!isNaN(ro)) result.ringOffset = ro;
  result.ringColorMode = parts[18] === 'c' ? 'custom' : 'auto' as ColorMode;
  if (parts[19] && /^[0-9a-fA-F]{6}$/.test(parts[19])) result.ringCustomColor = '#' + parts[19];

  // Separation
  if (SEPARATION_MODES.has(parts[20])) result.separationMode = parts[20] as SeparationMode;

  return result;
}
