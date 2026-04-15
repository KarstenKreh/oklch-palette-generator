import { useEffect, useRef, useState } from 'react';
import { useSpaceStore } from '@/store/space-store';
import { encodeState, decodeState } from '@/lib/url-state';
import { isUnifiedHash, getMySegment, buildUnifiedHash } from '@core/unified-hash';

interface OtherSegments { c?: string; t?: string; s?: string; y?: string }

/**
 * Two-way sync between space store and URL hash.
 * Returns the other segments (c, t, s, y) for hash building.
 */
export function useUrlState(): OtherSegments {
  const store = useSpaceStore();
  const initialized = useRef(false);
  const skipNextWrite = useRef(false);
  const [others, setOthers] = useState<OtherSegments>({});
  const othersRef = useRef<OtherSegments>({});

  // Phase 1: Read hash on mount
  useEffect(() => {
    const raw = window.location.hash.slice(1);

    const captured: OtherSegments = {};
    if (raw && isUnifiedHash(raw)) {
      captured.c = getMySegment(raw, 'c') || undefined;
      captured.t = getMySegment(raw, 't') || undefined;
      captured.s = getMySegment(raw, 's') || undefined;
      captured.y = getMySegment(raw, 'y') || undefined;
      const spaceRaw = getMySegment(raw, 'p');
      if (spaceRaw) {
        const decoded = decodeState(spaceRaw);
        if (decoded) store.setFullState(decoded);
      }
    }
    othersRef.current = captured;
    setOthers(captured);

    initialized.current = true;
    skipNextWrite.current = true;

    const currentStore = useSpaceStore.getState();
    const encoded = encodeState(currentStore);
    history.replaceState(null, '', '#' + buildUnifiedHash({
      c: captured.c, t: captured.t, s: captured.s, y: captured.y, p: encoded,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase 2: Write hash on state change
  useEffect(() => {
    if (!initialized.current) return;
    if (skipNextWrite.current) { skipNextWrite.current = false; return; }
    const encoded = encodeState(store);
    history.replaceState(null, '', '#' + buildUnifiedHash({
      c: othersRef.current.c, t: othersRef.current.t, s: othersRef.current.s, y: othersRef.current.y, p: encoded,
    }));
  }, [
    store.spacingMode, store.spacingBaseRem, store.spacingRatio, store.spacingMultiplier, store.spacingSnap,
    store.breakpoints, store.fluidMinVw, store.fluidMaxVw,
    store.containers, store.proseMaxCh,
    store.aspectRatios, store.aspectIncludeReciprocals,
  ]);

  return others;
}
