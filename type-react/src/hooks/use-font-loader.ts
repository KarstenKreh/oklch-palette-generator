import { useEffect, useSyncExternalStore } from 'react';
import {
  fetchFontCatalog,
  subscribeCatalog,
  getCatalog,
  loadFont,
  type FontEntry,
} from '@/lib/fontshare';
import { useTypeStore } from '@/store/type-store';

/**
 * Fetches the full Fontshare catalog on mount and
 * loads CSS for the currently-selected fonts on demand.
 */
export function useFontLoader() {
  const headingFont = useTypeStore((s) => s.headingFont);
  const bodyFont = useTypeStore((s) => s.bodyFont);
  const monoFont = useTypeStore((s) => s.monoFont);

  // Kick off the API fetch once
  useEffect(() => {
    fetchFontCatalog();
  }, []);

  // Load selected fonts on demand
  useEffect(() => {
    if (headingFont) loadFont(headingFont);
    if (bodyFont) loadFont(bodyFont);
    if (monoFont) loadFont(monoFont);
  }, [headingFont, bodyFont, monoFont]);
}

/**
 * Returns the live font catalog (updates when the API responds).
 */
export function useFontCatalog(): FontEntry[] {
  return useSyncExternalStore(subscribeCatalog, getCatalog);
}
