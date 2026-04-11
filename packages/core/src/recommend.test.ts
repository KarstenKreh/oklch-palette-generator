import { describe, it, expect } from 'vitest';
import { recommendSets, type SymbolPreferences } from './recommend';

describe('recommendSets', () => {
  it('returns all sets sorted by score', () => {
    const prefs: SymbolPreferences = { style: 'auto', mood: 50, weight: 'auto', corners: 'auto' };
    const results = recommendSets(prefs);
    expect(results.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it('ranks Material higher for serious/sharp preferences', () => {
    const prefs: SymbolPreferences = { style: 'outlined', mood: 20, weight: 'regular', corners: 'sharp' };
    const results = recommendSets(prefs);
    expect(results[0].set.id).toBe('material-outlined');
  });

  it('ranks Lucide higher for friendly/rounded preferences', () => {
    const prefs: SymbolPreferences = { style: 'outlined', mood: 60, weight: 'regular', corners: 'rounded' };
    const results = recommendSets(prefs);
    expect(results[0].set.id).toBe('lucide');
  });

  it('includes reasons for close matches', () => {
    const prefs: SymbolPreferences = { style: 'outlined', mood: 55, weight: 'regular', corners: 'rounded' };
    const results = recommendSets(prefs);
    const topResult = results[0];
    expect(topResult.reasons.length).toBeGreaterThan(0);
  });

  it('scores are between 0 and 1', () => {
    const prefs: SymbolPreferences = { style: 'auto', mood: 50, weight: 'auto', corners: 'auto' };
    const results = recommendSets(prefs);
    results.forEach((r) => {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    });
  });

  it('all-auto preferences still rank', () => {
    const prefs: SymbolPreferences = { style: 'auto', mood: 50, weight: 'auto', corners: 'auto' };
    const results = recommendSets(prefs);
    expect(results[0].score).toBeGreaterThan(0);
  });
});
