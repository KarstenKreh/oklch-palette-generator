/**
 * URL hash state encoding/decoding for the type scale generator.
 *
 * Format (v2):
 *   mode,baseSize,customRatio,mobileRatio,headingFont,bodyFont,monoFont[,trad...]|key=val&key=val
 *
 * The pipe separator divides the legacy positional part from extended key-value pairs.
 * Old URLs without a pipe are decoded with defaults for the new fields.
 *
 * Extended keys:
 *   hw  = headingWeight (100–900, default 500)
 *   mbs = mobileBaseSize (rem, default = baseSize)
 *   mrm = mobileRatioMode ('auto'|'custom', default 'auto')
 *   as  = autoShrink (%, default 25)
 *   sbm = spacingBaseMultiplier (number, default 1)
 *   lh  = lineHeightOverrides (level:val;level:val)
 *   ls  = letterSpacingOverrides (level:val;level:val)
 *   tm  = traditionalMobileAssignments (px,px,...  in TYPE_LEVELS order)
 */

import type { TypeLevel } from '@core/scale';
import { TYPE_LEVELS, DEFAULT_TRADITIONAL } from '@core/scale';

export interface UrlState {
  scaleMode: 'golden' | 'traditional' | 'custom';
  baseSize: number;
  customRatio: number;
  mobileRatio: number;
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  headingWeight: number;
  mobileBaseSize: number;
  mobileRatioMode: 'auto' | 'custom';
  autoShrink: number;
  spacingBaseMultiplier: number;
  lineHeightOverrides: Partial<Record<TypeLevel, number>>;
  letterSpacingOverrides: Partial<Record<TypeLevel, number>>;
  traditionalAssignments?: Record<TypeLevel, number>;
  traditionalMobileAssignments?: Record<TypeLevel, number>;
}

/* ── Encode ── */

function encodeOverrides(overrides: Partial<Record<TypeLevel, number>>): string {
  const entries = Object.entries(overrides).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  return entries.map(([k, v]) => `${k}:${v}`).join(';');
}

export function encodeState(state: UrlState): string {
  // Positional part (backward-compatible)
  const parts: (string | number)[] = [
    state.scaleMode,
    state.baseSize,
    state.customRatio,
    state.mobileRatio,
    state.headingFont,
    state.bodyFont,
    state.monoFont,
  ];

  if (state.scaleMode === 'traditional' && state.traditionalAssignments) {
    for (const level of TYPE_LEVELS) {
      parts.push(state.traditionalAssignments[level]);
    }
  }

  // Extended key-value pairs — only include non-default values
  const ext: string[] = [];

  if (state.headingWeight !== 500) ext.push(`hw=${state.headingWeight}`);
  if (state.mobileBaseSize !== state.baseSize) ext.push(`mbs=${state.mobileBaseSize}`);
  if (state.mobileRatioMode !== 'auto') ext.push(`mrm=${state.mobileRatioMode}`);
  if (state.autoShrink !== 25) ext.push(`as=${state.autoShrink}`);
  if (state.spacingBaseMultiplier !== 1) ext.push(`sbm=${state.spacingBaseMultiplier}`);

  const lh = encodeOverrides(state.lineHeightOverrides);
  if (lh) ext.push(`lh=${lh}`);

  const ls = encodeOverrides(state.letterSpacingOverrides);
  if (ls) ext.push(`ls=${ls}`);

  if (state.scaleMode === 'traditional' && state.traditionalMobileAssignments) {
    const tmParts = TYPE_LEVELS.map(l => state.traditionalMobileAssignments![l]);
    ext.push(`tm=${tmParts.join(',')}`);
  }

  const positional = parts.join(',');
  return ext.length > 0 ? `${positional}|${ext.join('&')}` : positional;
}

/* ── Decode ── */

function decodeOverrides(str: string): Partial<Record<TypeLevel, number>> {
  const result: Partial<Record<TypeLevel, number>> = {};
  if (!str) return result;
  for (const pair of str.split(';')) {
    const [key, val] = pair.split(':');
    if (key && val && TYPE_LEVELS.includes(key as TypeLevel)) {
      const n = parseFloat(val);
      if (!isNaN(n)) result[key as TypeLevel] = n;
    }
  }
  return result;
}

export function decodeState(hash: string): UrlState | null {
  const raw = hash.replace(/^#/, '');
  if (!raw) return null;

  // Split positional | extended
  const [positional, extStr] = raw.split('|');
  const parts = positional.split(',');
  if (parts.length < 7) return null;

  const mode = parts[0] as UrlState['scaleMode'];
  if (!['traditional', 'custom'].includes(mode)) return null;

  const baseSize = parseFloat(parts[1]);
  const customRatio = parseFloat(parts[2]);
  const mobileRatio = parseFloat(parts[3]);
  if (isNaN(baseSize) || isNaN(customRatio) || isNaN(mobileRatio)) return null;

  const state: UrlState = {
    scaleMode: mode,
    baseSize,
    customRatio,
    mobileRatio,
    headingFont: parts[4],
    bodyFont: parts[5],
    monoFont: parts[6],
    // Defaults for extended fields
    headingWeight: 500,
    mobileBaseSize: baseSize,
    mobileRatioMode: 'auto',
    autoShrink: 25,
    spacingBaseMultiplier: 1,
    lineHeightOverrides: {},
    letterSpacingOverrides: {},
  };

  // Traditional desktop assignments (positional)
  if (mode === 'traditional' && parts.length >= 16) {
    const assignments = {} as Record<TypeLevel, number>;
    const levelCount = Math.min(TYPE_LEVELS.length, parts.length - 7);
    for (let i = 0; i < levelCount; i++) {
      const val = parseFloat(parts[7 + i]);
      if (isNaN(val)) return null;
      assignments[TYPE_LEVELS[i]] = val;
    }
    for (const level of TYPE_LEVELS) {
      if (!(level in assignments)) {
        assignments[level] = DEFAULT_TRADITIONAL[level];
      }
    }
    state.traditionalAssignments = assignments;
  }

  // Parse extended key-value pairs
  if (extStr) {
    const params = new URLSearchParams(extStr);

    const hw = params.get('hw');
    if (hw) { const n = parseInt(hw); if (!isNaN(n)) state.headingWeight = n; }

    // wc (weightCompensation) was removed — ignore if present in old URLs

    const mbs = params.get('mbs');
    if (mbs) { const n = parseFloat(mbs); if (!isNaN(n)) state.mobileBaseSize = n; }

    const mrm = params.get('mrm');
    if (mrm === 'custom') state.mobileRatioMode = 'custom';

    const as = params.get('as');
    if (as) { const n = parseFloat(as); if (!isNaN(n)) state.autoShrink = n; }

    const sbm = params.get('sbm');
    if (sbm) { const n = parseFloat(sbm); if (!isNaN(n)) state.spacingBaseMultiplier = n; }

    const lh = params.get('lh');
    if (lh) state.lineHeightOverrides = decodeOverrides(lh);

    const ls = params.get('ls');
    if (ls) state.letterSpacingOverrides = decodeOverrides(ls);

    const tm = params.get('tm');
    if (tm && mode === 'traditional') {
      const tmParts = tm.split(',');
      const tmAssign = {} as Record<TypeLevel, number>;
      for (let i = 0; i < Math.min(TYPE_LEVELS.length, tmParts.length); i++) {
        const val = parseFloat(tmParts[i]);
        if (!isNaN(val)) tmAssign[TYPE_LEVELS[i]] = val;
      }
      state.traditionalMobileAssignments = tmAssign;
    }
  }

  return state;
}
