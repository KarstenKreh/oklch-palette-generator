import { useEffect, useRef, useState } from 'react';
import { useShapeStore } from '@/store/shape-store';
import { encodeState, decodeState } from '@/lib/url-state';
import { isUnifiedHash, getMySegment, buildUnifiedHash } from '@core/unified-hash';

interface OtherSegments { c?: string; t?: string; y?: string }

/**
 * Two-way sync between shape store and URL hash.
 * Returns the other segments (c, t) for hash building.
 */
export function useUrlState(): OtherSegments {
  const store = useShapeStore();
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
      captured.y = getMySegment(raw, 'y') || undefined;
      const shapeRaw = getMySegment(raw, 's');
      if (shapeRaw) {
        const decoded = decodeState(shapeRaw);
        if (decoded) store.setFullState(decoded);
      }
    }
    othersRef.current = captured;
    setOthers(captured);

    initialized.current = true;
    skipNextWrite.current = true;

    // Write hash immediately using latest store state (not stale closure)
    const currentStore = useShapeStore.getState();
    const encoded = encodeState(currentStore);
    history.replaceState(null, '', '#' + buildUnifiedHash({
      c: captured.c, t: captured.t, s: encoded, y: captured.y,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase 2: Write hash on state change
  useEffect(() => {
    if (!initialized.current) return;
    if (skipNextWrite.current) { skipNextWrite.current = false; return; }
    const encoded = encodeState(store);
    history.replaceState(null, '', '#' + buildUnifiedHash({
      c: othersRef.current.c, t: othersRef.current.t, s: encoded, y: othersRef.current.y,
    }));
  }, [
    store.shadowEnabled, store.shadowType, store.shadowStrength, store.shadowBlurScale, store.shadowScale,
    store.shadowColorMode, store.shadowCustomColor,
    store.borderEnabled, store.borderWidth, store.borderColorMode, store.borderCustomColor,
    store.borderRadius,
    store.shapeStyle, store.glassDepth, store.glassBlur, store.glassDispersion,
    store.ringWidth, store.ringOffset, store.ringColorMode, store.ringCustomColor,
    store.separationMode,
  ]);

  return others;
}
