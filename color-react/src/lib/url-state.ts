// URL state serialization — pure functions, no DOM access

import type { Accent, FgContrastMode } from '@/store/theme-store';
import type { PaletteMode } from './palette';

interface EncodableState {
  brandHex: string;
  bgColorHex: string;
  bgAutoMatch: boolean;
  errorColorHex: string;
  errorAutoMatch: boolean;
  chromaScale: number;
  currentMode: PaletteMode;
  brandPin: boolean;
  brandInvert: boolean;
  errorPin: boolean;
  errorInvert: boolean;
  fgContrastMode: FgContrastMode;
  themeName: string;
  extraAccents: Accent[];
}

export function encodeState(s: EncodableState): string {
  const brand = s.brandHex.replace('#', '');
  const bg = s.bgColorHex.replace('#', '');
  const err = s.errorColorHex.replace('#', '');
  const chroma = Math.round(s.chromaScale * 100);
  let hash = `${brand},${bg},${s.bgAutoMatch ? 1 : 0},${err},${s.errorAutoMatch ? 1 : 0},${chroma},${s.currentMode},${s.brandPin ? 1 : 0},${s.errorPin ? 1 : 0},${s.fgContrastMode},${encodeURIComponent(s.themeName)},${s.brandInvert ? 1 : 0},${s.errorInvert ? 1 : 0}`;
  s.extraAccents.forEach(a => {
    hash += `!${encodeURIComponent(a.name)}:${a.hex.replace('#', '')}:${a.pin ? 1 : 0}:${a.autoMatch ? 1 : 0}:${Math.round(a.autoHue)}:${a.invert ? 1 : 0}`;
  });
  return hash;
}

interface DecodedState {
  brandHex: string;
  bgColorHex: string;
  bgAutoMatch: boolean;
  errorColorHex: string;
  errorAutoMatch: boolean;
  chromaScale: number;
  currentMode: PaletteMode;
  brandPin: boolean;
  brandInvert: boolean;
  errorPin: boolean;
  errorInvert: boolean;
  fgContrastMode: FgContrastMode;
  themeName: string;
  extraAccents: Accent[];
}

export function decodeState(hash: string): DecodedState | null {
  if (!hash) return null;
  const segments = hash.split('!');
  const p = segments[0].split(',');
  if (p.length < 7) return null;

  const [brand, bg, bgAuto, err, errAuto, chroma, mode] = p;

  if (!/^[0-9a-fA-F]{6}$/.test(brand)) return null;

  const result: DecodedState = {
    brandHex: '#' + brand.toUpperCase(),
    bgColorHex: /^[0-9a-fA-F]{6}$/.test(bg) ? '#' + bg.toUpperCase() : '#' + brand.toUpperCase(),
    bgAutoMatch: bgAuto === '1',
    errorColorHex: /^[0-9a-fA-F]{6}$/.test(err) ? '#' + err.toUpperCase() : '#CC3333',
    errorAutoMatch: errAuto === '1',
    chromaScale: 0.25,
    currentMode: (mode === 'balanced' || mode === 'exact') ? mode : 'balanced',
    brandPin: p[7] === '1',
    errorPin: p[8] === '1',
    fgContrastMode: 'best',
    themeName: 'Standby.Design',
  };

  const chromaVal = parseInt(chroma);
  if (!isNaN(chromaVal) && chromaVal >= 0 && chromaVal <= 100) {
    result.chromaScale = chromaVal / 100;
  }

  if (p.length > 9) {
    const fgMode = p[9];
    if (fgMode === 'best' || fgMode === 'preferLight' || fgMode === 'preferDark') {
      result.fgContrastMode = fgMode;
    }
  }

  result.themeName = p.length > 10 && p[10] ? decodeURIComponent(p[10]) : 'Standby.Design';

  // v2 fields: brandInvert (pos 11), errorInvert (pos 12) — default false for old URLs
  result.brandInvert = p.length > 11 && p[11] === '1';
  result.errorInvert = p.length > 12 && p[12] === '1';

  result.extraAccents = [];
  for (let i = 1; i < segments.length; i++) {
    const firstColon = segments[i].indexOf(':');
    if (firstColon === -1) continue;
    const rawName = segments[i].substring(0, firstColon);
    const rest = segments[i].substring(firstColon + 1);
    const restParts = rest.split(':');
    const rawHex = restParts[0];
    const pin = restParts[1] === '1';
    const autoMatch = restParts[2] === '1';
    const autoHue = restParts[3] ? parseInt(restParts[3]) || 0 : 0;
    const accentInvert = restParts[4] === '1';
    const name = decodeURIComponent(rawName) || ('Extra ' + i);
    if (autoMatch || /^[0-9a-fA-F]{6}$/.test(rawHex)) {
      result.extraAccents.push({ name, hex: '#' + rawHex.toUpperCase(), pin, invert: accentInvert, autoMatch, autoHue });
    }
  }

  return result;
}
