import { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '@/store/theme-store';
import { encodeState, decodeState } from '@/lib/url-state';
import { isUnifiedHash, getMySegment, buildUnifiedHash } from '@core/unified-hash';

interface OtherSegments { t?: string; s?: string }

/**
 * Returns the other tools' hash segments (t=, s=), captured at mount.
 * Uses state so it triggers a re-render for nav links.
 */
export function useUrlState() {
  const store = useThemeStore();
  const initialized = useRef(false);
  const skipNextWrite = useRef(false);
  const [others, setOthers] = useState<OtherSegments>({});
  const othersRef = useRef<OtherSegments>({});

  useEffect(() => {
    const raw = window.location.hash.slice(1);
    const unified = isUnifiedHash(raw);

    const captured: OtherSegments = {
      t: unified ? (getMySegment(raw, 't') || undefined) : undefined,
      s: unified ? (getMySegment(raw, 's') || undefined) : undefined,
    };
    othersRef.current = captured;
    setOthers(captured);

    if (raw) {
      const colorSegment = unified ? getMySegment(raw, 'c') : raw;
      if (colorSegment) {
        const decoded = decodeState(colorSegment);
        if (decoded) store.setFullState(decoded);
      }
    }
    initialized.current = true;
    skipNextWrite.current = true;

    const currentStore = useThemeStore.getState();
    const encoded = encodeState(currentStore);
    history.replaceState(null, '', '#' + buildUnifiedHash({
      c: encoded, t: captured.t, s: captured.s,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    if (skipNextWrite.current) { skipNextWrite.current = false; return; }
    const encoded = encodeState(store);
    history.replaceState(null, '', '#' + buildUnifiedHash({
      c: encoded, t: othersRef.current.t, s: othersRef.current.s,
    }));
  }, [
    store.brandHex, store.bgColorHex, store.bgAutoMatch,
    store.errorColorHex, store.errorAutoMatch, store.chromaScale,
    store.currentMode, store.brandPin, store.errorPin,
    store.fgContrastMode, store.themeName, store.extraAccents,
  ]);

  return others;
}
