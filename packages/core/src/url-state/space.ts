/**
 * URL hash state encoding/decoding for the Space tool.
 * Shared between space-react and system-react.
 *
 * Positional head (always present, 5 fields):
 *   mode,baseRem×1000,ratio×1000,multiplier×100,snap
 *
 * Extended tail (|-separated, &-joined, omitted when equal to defaults):
 *   bp=sm:640;md:768;…        breakpoints
 *   fvw=375,1920              fluid viewport anchors
 *   ct=prose:680;default:1200 containers
 *   pch=65                    prose max ch
 *   ar=square:1:1;golden:1618:1000   aspect ratios (w/h × 1000 for decimals)
 *   arr=1                     include reciprocals flag
 */

import type { SpacingMode } from '../spacing';
import type { Breakpoint, Container } from '../layout';
import type { AspectRatio } from '../aspect';
import { DEFAULT_BREAKPOINTS, DEFAULT_CONTAINERS, DEFAULT_FLUID_MIN_VW, DEFAULT_FLUID_MAX_VW, DEFAULT_PROSE_MAX_CH } from '../layout';
import { DEFAULT_ASPECT_RATIOS } from '../aspect';

export interface SpaceUrlState {
  spacingMode: SpacingMode;
  spacingBaseRem: number;
  spacingRatio: number;
  spacingMultiplier: number;
  spacingSnap: boolean;

  breakpoints: Breakpoint[];
  fluidMinVw: number;
  fluidMaxVw: number;

  containers: Container[];
  proseMaxCh: number;

  aspectRatios: AspectRatio[];
  aspectIncludeReciprocals: boolean;
}

/* ── Defaults ── */

export const DEFAULT_SPACE_URL_STATE: SpaceUrlState = {
  spacingMode: 'harmonic',
  spacingBaseRem: 1.0,
  spacingRatio: 1.272,
  spacingMultiplier: 1.0,
  spacingSnap: true,

  breakpoints: DEFAULT_BREAKPOINTS,
  fluidMinVw: DEFAULT_FLUID_MIN_VW,
  fluidMaxVw: DEFAULT_FLUID_MAX_VW,

  containers: DEFAULT_CONTAINERS,
  proseMaxCh: DEFAULT_PROSE_MAX_CH,

  aspectRatios: DEFAULT_ASPECT_RATIOS,
  aspectIncludeReciprocals: false,
};

/* ── Encode helpers ── */

function breakpointsEqualDefault(bps: Breakpoint[]): boolean {
  if (bps.length !== DEFAULT_BREAKPOINTS.length) return false;
  return bps.every((b, i) => b.name === DEFAULT_BREAKPOINTS[i].name && b.minPx === DEFAULT_BREAKPOINTS[i].minPx);
}

function containersEqualDefault(cts: Container[]): boolean {
  if (cts.length !== DEFAULT_CONTAINERS.length) return false;
  return cts.every((c, i) => c.name === DEFAULT_CONTAINERS[i].name && c.maxPx === DEFAULT_CONTAINERS[i].maxPx);
}

function aspectsEqualDefault(ars: AspectRatio[]): boolean {
  if (ars.length !== DEFAULT_ASPECT_RATIOS.length) return false;
  return ars.every((a, i) => a.name === DEFAULT_ASPECT_RATIOS[i].name && a.w === DEFAULT_ASPECT_RATIOS[i].w && a.h === DEFAULT_ASPECT_RATIOS[i].h);
}

function encodeAspect(a: AspectRatio): string {
  // For integer w/h, emit as-is. For decimals, ×1000.
  const wInt = Number.isInteger(a.w);
  const hInt = Number.isInteger(a.h);
  if (wInt && hInt) return `${a.name}:${a.w}:${a.h}`;
  return `${a.name}:${Math.round(a.w * 1000)}:${Math.round(a.h * 1000)}`;
}

function decodeAspectField(s: string, h: string): number {
  // Heuristic: if value >= 100 assume ×1000 encoding (decimals). Else integer.
  const n = parseFloat(s);
  if (isNaN(n)) return 0;
  return n >= 100 ? n / 1000 : n;
}

/* ── Encode ── */

export function encodeState(s: SpaceUrlState): string {
  const head = [
    s.spacingMode,
    Math.round(s.spacingBaseRem * 1000),
    Math.round(s.spacingRatio * 1000),
    Math.round(s.spacingMultiplier * 100),
    s.spacingSnap ? 1 : 0,
  ].join(',');

  const ext: string[] = [];

  if (!breakpointsEqualDefault(s.breakpoints)) {
    const bpStr = s.breakpoints.map((b) => `${b.name}:${b.minPx}`).join(';');
    ext.push(`bp=${bpStr}`);
  }
  if (s.fluidMinVw !== DEFAULT_FLUID_MIN_VW || s.fluidMaxVw !== DEFAULT_FLUID_MAX_VW) {
    ext.push(`fvw=${s.fluidMinVw},${s.fluidMaxVw}`);
  }
  if (!containersEqualDefault(s.containers)) {
    const ctStr = s.containers.map((c) => `${c.name}:${c.maxPx}`).join(';');
    ext.push(`ct=${ctStr}`);
  }
  if (s.proseMaxCh !== DEFAULT_PROSE_MAX_CH) {
    ext.push(`pch=${s.proseMaxCh}`);
  }
  if (!aspectsEqualDefault(s.aspectRatios)) {
    const arStr = s.aspectRatios.map(encodeAspect).join(';');
    ext.push(`ar=${arStr}`);
  }
  if (s.aspectIncludeReciprocals) {
    ext.push(`arr=1`);
  }

  return ext.length > 0 ? `${head}|${ext.join('&')}` : head;
}

/* ── Decode ── */

const VALID_MODES = new Set<SpacingMode>(['harmonic', 'geometric']);

export function decodeState(raw: string): Partial<SpaceUrlState> | null {
  if (!raw) return null;

  const [head, extStr] = raw.split('|');
  const parts = head.split(',');
  if (parts.length < 5) return null;

  const result: Partial<SpaceUrlState> = {};

  if (VALID_MODES.has(parts[0] as SpacingMode)) {
    result.spacingMode = parts[0] as SpacingMode;
  }
  const baseRem = parseInt(parts[1]);
  if (!isNaN(baseRem)) result.spacingBaseRem = baseRem / 1000;
  const ratio = parseInt(parts[2]);
  if (!isNaN(ratio)) result.spacingRatio = ratio / 1000;
  const mult = parseInt(parts[3]);
  if (!isNaN(mult)) result.spacingMultiplier = mult / 100;
  if (parts[4] === '0' || parts[4] === '1') result.spacingSnap = parts[4] === '1';

  if (!extStr) return result;

  const params = new URLSearchParams(extStr);

  const bp = params.get('bp');
  if (bp) {
    const bps: Breakpoint[] = [];
    for (const entry of bp.split(';')) {
      const [name, px] = entry.split(':');
      const n = parseInt(px);
      if (name && !isNaN(n)) bps.push({ name, minPx: n });
    }
    if (bps.length > 0) result.breakpoints = bps;
  }

  const fvw = params.get('fvw');
  if (fvw) {
    const [minS, maxS] = fvw.split(',');
    const min = parseInt(minS);
    const max = parseInt(maxS);
    if (!isNaN(min)) result.fluidMinVw = min;
    if (!isNaN(max)) result.fluidMaxVw = max;
  }

  const ct = params.get('ct');
  if (ct) {
    const cts: Container[] = [];
    for (const entry of ct.split(';')) {
      const [name, px] = entry.split(':');
      const n = parseInt(px);
      if (name && !isNaN(n)) cts.push({ name, maxPx: n });
    }
    if (cts.length > 0) result.containers = cts;
  }

  const pch = params.get('pch');
  if (pch) {
    const n = parseInt(pch);
    if (!isNaN(n)) result.proseMaxCh = n;
  }

  const ar = params.get('ar');
  if (ar) {
    const ars: AspectRatio[] = [];
    for (const entry of ar.split(';')) {
      const [name, wS, hS] = entry.split(':');
      if (!name || wS === undefined || hS === undefined) continue;
      const w = decodeAspectField(wS, hS);
      const h = decodeAspectField(hS, wS);
      if (w > 0 && h > 0) ars.push({ name, w, h });
    }
    if (ars.length > 0) result.aspectRatios = ars;
  }

  const arr = params.get('arr');
  if (arr === '1') result.aspectIncludeReciprocals = true;

  return result;
}
