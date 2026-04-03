import { useEffect, useRef } from 'react';
import { useTypeStore } from '@/store/type-store';
import { encodeState, decodeState } from '@/lib/url-state';

/**
 * Two-way sync between Zustand store and URL hash.
 * - On mount: reads hash → populates store
 * - On store change: writes store → hash
 */
export function useUrlState() {
  const store = useTypeStore();
  const initialized = useRef(false);

  // On mount: restore from hash
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      initialized.current = true;
      return;
    }

    const state = decodeState(hash);
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

    initialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On store change: write hash
  useEffect(() => {
    if (!initialized.current) return;

    const encoded = encodeState({
      scaleMode: store.scaleMode,
      baseSize: store.baseSize,
      customRatio: store.customRatio,
      mobileRatio: store.mobileRatio,
      headingFont: store.headingFont,
      bodyFont: store.bodyFont,
      monoFont: store.monoFont,
      traditionalAssignments:
        store.scaleMode === 'traditional'
          ? store.traditionalAssignments
          : undefined,
    });

    window.location.hash = encoded;
  }, [
    store.scaleMode,
    store.baseSize,
    store.customRatio,
    store.mobileRatio,
    store.headingFont,
    store.bodyFont,
    store.monoFont,
    store.traditionalAssignments,
  ]);
}
