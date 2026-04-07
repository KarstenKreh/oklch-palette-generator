import type { ShapeState, ShadowType, ColorMode, SeparationMode } from '@/store/shape-store';

/**
 * Encode shape state into a compact comma-separated string.
 *
 * Format: shadowEnabled,shadowType,strength,blurScale,shadowColorMode,shadowCustomHex,
 *         borderEnabled,borderWidth,borderColorMode,borderCustomHex,
 *         borderRadius,
 *         glassEnabled,glassBlur,glassOpacity,
 *         ringWidth,ringOffset,ringColorMode,ringCustomHex,
 *         separationMode
 */
export function encodeState(s: ShapeState): string {
  return [
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
    s.glassEnabled ? 1 : 0,
    s.glassBlur,
    Math.round(s.glassOpacity * 100),
    s.ringWidth,
    s.ringOffset,
    s.ringColorMode === 'auto' ? 'a' : 'c',
    s.ringColorMode === 'custom' ? s.ringCustomColor.replace('#', '') : '',
    s.separationMode,
  ].join(',');
}

const SHADOW_TYPES = new Set(['normal', 'neumorphic', 'flat']);
const SEPARATION_MODES = new Set(['shadow', 'border', 'contrast', 'gap', 'mixed']);

export function decodeState(raw: string): Partial<ShapeState> | null {
  const parts = raw.split(',');
  if (parts.length < 20) return null;

  const result: Partial<ShapeState> = {};

  // Shadow
  if (parts[0] === '0' || parts[0] === '1') result.shadowEnabled = parts[0] === '1';
  if (SHADOW_TYPES.has(parts[1])) result.shadowType = parts[1] as ShadowType;
  const strength = parseInt(parts[2]);
  if (!isNaN(strength)) result.shadowStrength = strength / 100;
  const blur = parseInt(parts[3]);
  if (!isNaN(blur)) result.shadowBlurScale = blur / 100;
  const scale = parseInt(parts[4]);
  if (!isNaN(scale)) result.shadowScale = scale / 1000;
  result.shadowColorMode = parts[5] === 'c' ? 'custom' : 'auto' as ColorMode;
  if (parts[6] && /^[0-9a-fA-F]{6}$/.test(parts[6])) result.shadowCustomColor = '#' + parts[6];

  // Border
  if (parts[7] === '0' || parts[7] === '1') result.borderEnabled = parts[7] === '1';
  const bw = parseInt(parts[8]);
  if (!isNaN(bw)) result.borderWidth = bw / 10;
  result.borderColorMode = parts[9] === 'c' ? 'custom' : 'auto' as ColorMode;
  if (parts[10] && /^[0-9a-fA-F]{6}$/.test(parts[10])) result.borderCustomColor = '#' + parts[10];

  // Radius
  const radius = parseInt(parts[11]);
  if (!isNaN(radius)) result.borderRadius = radius;

  // Glass
  if (parts[12] === '0' || parts[12] === '1') result.glassEnabled = parts[12] === '1';
  const gBlur = parseInt(parts[13]);
  if (!isNaN(gBlur)) result.glassBlur = gBlur;
  const gOpacity = parseInt(parts[14]);
  if (!isNaN(gOpacity)) result.glassOpacity = gOpacity / 100;

  // Ring
  const rw = parseInt(parts[15]);
  if (!isNaN(rw)) result.ringWidth = rw;
  const ro = parseInt(parts[16]);
  if (!isNaN(ro)) result.ringOffset = ro;
  result.ringColorMode = parts[17] === 'c' ? 'custom' : 'auto' as ColorMode;
  if (parts[18] && /^[0-9a-fA-F]{6}$/.test(parts[18])) result.ringCustomColor = '#' + parts[18];

  // Separation
  if (SEPARATION_MODES.has(parts[19])) result.separationMode = parts[19] as SeparationMode;

  return result;
}
