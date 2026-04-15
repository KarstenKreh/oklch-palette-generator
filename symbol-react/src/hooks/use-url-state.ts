import { useEffect, useRef, useState } from 'react';
import { useSymbolStore } from '@/store/symbol-store';
import { encodeState, decodeState } from '@/lib/url-state';
import { isUnifiedHash, getMySegment, buildUnifiedHash } from '@core/unified-hash';

interface OtherSegments { c?: string; t?: string; s?: string; p?: string }

/**
 * Two-way sync between symbol store and URL hash.
 * Returns the other segments (c, t, s) for hash building.
 */
export function useUrlState(): OtherSegments {
  const store = useSymbolStore();
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
      captured.p = getMySegment(raw, 'p') || undefined;
      const symbolRaw = getMySegment(raw, 'y');
      if (symbolRaw) {
        const decoded = decodeState(symbolRaw);
        if (decoded) store.setFullState(decoded);
      }

      // Read brand color from color segment for surfaceHex
      if (captured.c) {
        const colorParts = captured.c.split(',');
        if (colorParts[0] && /^[0-9A-Fa-f]{6}$/.test(colorParts[0])) {
          store.setSurfaceHex('#' + colorParts[0]);
        }
      }
    }
    othersRef.current = captured;
    setOthers(captured);

    initialized.current = true;
    skipNextWrite.current = true;

    const currentStore = useSymbolStore.getState();
    const encoded = encodeState(currentStore);
    history.replaceState(null, '', '#' + buildUnifiedHash({
      c: captured.c, t: captured.t, s: captured.s, y: encoded, p: captured.p,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase 2: Write hash on state change
  useEffect(() => {
    if (!initialized.current) return;
    if (skipNextWrite.current) { skipNextWrite.current = false; return; }
    const encoded = encodeState(store);
    history.replaceState(null, '', '#' + buildUnifiedHash({
      c: othersRef.current.c, t: othersRef.current.t, s: othersRef.current.s, y: encoded, p: othersRef.current.p,
    }));
  }, [
    store.preferredStyle, store.preferredWeight, store.preferredCorners,
    store.iconBaseSize, store.iconScale, store.snapTo4px, store.selectedSet,
  ]);

  return others;
}
