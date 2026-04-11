/**
 * Icon set recommendation engine.
 * Scores curated sets against user preferences using weighted multi-factor scoring.
 */

import { ICON_SETS, type IconSetDefinition, type IconSetStyle, type IconSetWeight, type IconSetCorners } from './icon-sets';

export interface SymbolPreferences {
  style: IconSetStyle | 'auto';
  mood: number;
  weight: IconSetWeight | 'auto';
  corners: IconSetCorners | 'auto';
}

export interface RecommendedSet {
  set: IconSetDefinition;
  score: number;
  reasons: string[];
}

const WEIGHT_ORDER: IconSetWeight[] = ['thin', 'regular', 'bold'];

function styleScore(pref: IconSetStyle | 'auto', actual: IconSetStyle): { score: number; reason: string | null } {
  if (pref === 'auto') return { score: 0.7, reason: null };
  if (pref === actual) return { score: 1.0, reason: `${actual} style matches` };
  return { score: 0.2, reason: null };
}

function moodScore(prefMood: number, setMood: number): { score: number; reason: string | null } {
  const score = Math.exp(-Math.pow(setMood - prefMood, 2) / 2000);
  const diff = Math.abs(setMood - prefMood);
  if (diff <= 15) return { score, reason: 'mood closely matches' };
  return { score, reason: null };
}

function weightScore(pref: IconSetWeight | 'auto', actual: IconSetWeight): { score: number; reason: string | null } {
  if (pref === 'auto') return { score: 0.7, reason: null };
  if (pref === actual) return { score: 1.0, reason: `${actual} weight matches` };
  const prefIdx = WEIGHT_ORDER.indexOf(pref);
  const actIdx = WEIGHT_ORDER.indexOf(actual);
  if (Math.abs(prefIdx - actIdx) === 1) return { score: 0.5, reason: null };
  return { score: 0.1, reason: null };
}

function cornerScore(pref: IconSetCorners | 'auto', actual: IconSetCorners): { score: number; reason: string | null } {
  if (pref === 'auto') return { score: 0.7, reason: null };
  if (pref === actual) return { score: 1.0, reason: `${actual} corners match` };
  if (actual === 'mixed') return { score: 0.6, reason: null };
  return { score: 0.2, reason: null };
}

/**
 * Score and rank icon sets against given preferences.
 * Returns all sets sorted by score descending.
 */
export function recommendSets(prefs: SymbolPreferences): RecommendedSet[] {
  return ICON_SETS.map((set) => {
    const style = styleScore(prefs.style, set.style);
    const mood = moodScore(prefs.mood, set.mood);
    const weight = weightScore(prefs.weight, set.strokeWeight);
    const corners = cornerScore(prefs.corners, set.cornerStyle);

    const score = style.score * 0.25 + mood.score * 0.30 + weight.score * 0.20 + corners.score * 0.25;
    const reasons = [style.reason, mood.reason, weight.reason, corners.reason].filter(Boolean) as string[];

    return { set, score, reasons };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Derive symbol preferences from shape + type URL state.
 * Returns partial overrides — auto values for anything not derivable.
 */
export function deriveFromShapeState(shapeSegment: string): Partial<SymbolPreferences> {
  const parts = shapeSegment.split(',');
  const result: Partial<SymbolPreferences> = {};

  // Shape state format: shapeStyle,shadowEnabled,shadowType,...,borderRadius(index 12),...
  // After core extraction the format may vary, so we look for borderRadius at known positions
  const borderRadius = parseInt(parts[12], 10);
  if (!isNaN(borderRadius)) {
    if (borderRadius >= 12) {
      result.corners = 'rounded';
    } else if (borderRadius <= 4) {
      result.corners = 'sharp';
    }
  }

  return result;
}
