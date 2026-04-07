import { useEffect, useRef } from 'react';
import { useShapeStore } from '@/store/shape-store';
import { encodeState, decodeState } from '@/lib/url-state';
import { isUnifiedHash, getMySegment, setMySegment } from '@/lib/unified-hash';

/**
 * Two-way sync between shape store and URL hash.
 * Returns the other segments (c, t) for hash building.
 */
export function useUrlState(): { c: string | null; t: string | null } {
  const store = useShapeStore();
  const initialized = useRef(false);
  const otherSegments = useRef<{ c: string | null; t: string | null }>({ c: null, t: null });

  // Phase 1: Read hash on mount
  useEffect(() => {
    const raw = window.location.hash.slice(1);
    if (!raw) { initialized.current = true; return; }

    if (isUnifiedHash(raw)) {
      otherSegments.current.c = getMySegment(raw, 'c');
      otherSegments.current.t = getMySegment(raw, 't');
      const shapeRaw = getMySegment(raw, 's');
      if (shapeRaw) {
        const decoded = decodeState(shapeRaw);
        if (decoded) store.setFullState(decoded);
      }
    }
    initialized.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase 2: Write hash on state change
  useEffect(() => {
    if (!initialized.current) return;
    const encoded = encodeState(store);
    const current = window.location.hash.slice(1);
    const newHash = setMySegment(current, 's', encoded);
    history.replaceState(null, '', '#' + newHash);
  }, [
    store.shadowEnabled, store.shadowType, store.shadowStrength, store.shadowBlurScale, store.shadowScale,
    store.shadowColorMode, store.shadowCustomColor,
    store.borderEnabled, store.borderWidth, store.borderColorMode, store.borderCustomColor,
    store.borderRadius,
    store.glassEnabled, store.glassBlur, store.glassOpacity,
    store.ringWidth, store.ringOffset, store.ringColorMode, store.ringCustomColor,
    store.separationMode,
    store,
  ]);

  return otherSegments.current;
}
