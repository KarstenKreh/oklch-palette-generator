/**
 * URL hash state encoding/decoding for the type scale generator.
 *
 * Format: #mode,baseSize,customRatio,mobileRatio,headingFont,bodyFont,monoFont[,assignments...]
 *
 * Assignments are only present for traditional mode (9 comma-separated px values).
 */

import type { TypeLevel } from './scale';
import { TYPE_LEVELS, DEFAULT_TRADITIONAL } from './scale';

export interface UrlState {
  scaleMode: 'golden' | 'traditional' | 'custom';
  baseSize: number;
  customRatio: number;
  mobileRatio: number;
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  traditionalAssignments?: Record<TypeLevel, number>;
}

export function encodeState(state: UrlState): string {
  const parts = [
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

  return parts.join(',');
}

export function decodeState(hash: string): UrlState | null {
  const raw = hash.replace(/^#/, '');
  if (!raw) return null;

  const parts = raw.split(',');
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
  };

  if (mode === 'traditional' && parts.length >= 16) {
    const assignments = {} as Record<TypeLevel, number>;
    const levelCount = Math.min(TYPE_LEVELS.length, parts.length - 7);
    for (let i = 0; i < levelCount; i++) {
      const val = parseFloat(parts[7 + i]);
      if (isNaN(val)) return null;
      assignments[TYPE_LEVELS[i]] = val;
    }
    // Fill missing levels with defaults (backward compat for old URLs)
    for (const level of TYPE_LEVELS) {
      if (!(level in assignments)) {
        assignments[level] = DEFAULT_TRADITIONAL[level];
      }
    }
    state.traditionalAssignments = assignments;
  }

  return state;
}
