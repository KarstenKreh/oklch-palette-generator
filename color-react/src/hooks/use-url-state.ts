import { useEffect, useMemo, useRef, useState } from 'react';
import { useThemeStore } from '@/store/theme-store';
import { encodeState, decodeState } from '@/lib/url-state';
import { isUnifiedHash, getMySegment, buildUnifiedHash } from '@core/unified-hash';
import { decodeState as decodeShapeState, type ShapeUrlState } from '@core/url-state/shape';

interface OtherSegments { t?: string; s?: string; y?: string; p?: string }

export interface UrlStateResult extends OtherSegments {
  shape: Partial<ShapeUrlState> | null;
}

/**
 * Returns the other tools' hash segments (t=, s=, y=), captured at mount.
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
      y: unified ? (getMySegment(raw, 'y') || undefined) : undefined,
      p: unified ? (getMySegment(raw, 'p') || undefined) : undefined,
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
      c: encoded, t: captured.t, s: captured.s, y: captured.y, p: captured.p,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    if (skipNextWrite.current) { skipNextWrite.current = false; return; }
    const encoded = encodeState(store);
    history.replaceState(null, '', '#' + buildUnifiedHash({
      c: encoded, t: othersRef.current.t, s: othersRef.current.s, y: othersRef.current.y, p: othersRef.current.p,
    }));
  }, [
    store.brandHex, store.bgColorHex, store.bgAutoMatch,
    store.errorColorHex, store.errorAutoMatch, store.chromaScale,
    store.currentMode, store.brandPin, store.errorPin,
    store.fgContrastMode, store.themeName, store.extraAccents,
  ]);

  const shape = useMemo<Partial<ShapeUrlState> | null>(
    () => others.s ? decodeShapeState(others.s) : null,
    [others.s],
  );

  return { ...others, shape };
}
