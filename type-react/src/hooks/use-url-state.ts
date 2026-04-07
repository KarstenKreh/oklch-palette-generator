import { useEffect, useRef, useState } from 'react';
import { useTypeStore } from '@/store/type-store';
import { encodeState, decodeState } from '@/lib/url-state';
import { isUnifiedHash, getMySegment, buildUnifiedHash } from '@/lib/unified-hash';

interface OtherSegments { c?: string; s?: string }

/**
 * Returns the other tools' hash segments (c=, s=), captured at mount.
 * Uses state so it triggers a re-render for nav links.
 */
export function useUrlState() {
  const store = useTypeStore();
  const initialized = useRef(false);
  const skipNextWrite = useRef(false);
  const [others, setOthers] = useState<OtherSegments>({});
  const othersRef = useRef<OtherSegments>({});

  const encodeStore = (s: typeof store) => encodeState({
    scaleMode: s.scaleMode,
    baseSize: s.baseSize,
    customRatio: s.customRatio,
    mobileRatio: s.mobileRatio,
    headingFont: s.headingFont,
    bodyFont: s.bodyFont,
    monoFont: s.monoFont,
    traditionalAssignments:
      s.scaleMode === 'traditional' ? s.traditionalAssignments : undefined,
  });

  useEffect(() => {
    const raw = window.location.hash.slice(1);
    const unified = isUnifiedHash(raw);

    const captured: OtherSegments = {
      c: unified ? (getMySegment(raw, 'c') || undefined) : undefined,
      s: unified ? (getMySegment(raw, 's') || undefined) : undefined,
    };
    othersRef.current = captured;
    setOthers(captured);

    if (raw) {
      const typeSegment = unified ? getMySegment(raw, 't') : raw;
      if (typeSegment) {
        const state = decodeState(typeSegment);
        if (state) {
          const partial: Record<string, unknown> = {
            scaleMode: state.scaleMode,
            baseSize: state.baseSize,
            customRatio: state.customRatio,
            mobileRatio: state.mobileRatio,
            mobileRatioMode: 'custom' as const,
            headingFont: state.headingFont,
            bodyFont: state.bodyFont,
            monoFont: state.monoFont,
          };
          if (state.traditionalAssignments) {
            partial.traditionalAssignments = state.traditionalAssignments;
          }
          store.setFullState(partial);
        }
      }
    }

    initialized.current = true;
    skipNextWrite.current = true;

    const currentStore = useTypeStore.getState();
    const encoded = encodeStore(currentStore);
    history.replaceState(null, '', '#' + buildUnifiedHash({
      c: captured.c, t: encoded, s: captured.s,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    if (skipNextWrite.current) { skipNextWrite.current = false; return; }
    const encoded = encodeStore(store);
    history.replaceState(null, '', '#' + buildUnifiedHash({
      c: othersRef.current.c, t: encoded, s: othersRef.current.s,
    }));
  }, [
    store.scaleMode, store.baseSize, store.customRatio, store.mobileRatio,
    store.headingFont, store.bodyFont, store.monoFont, store.traditionalAssignments,
  ]);

  return others;
}
