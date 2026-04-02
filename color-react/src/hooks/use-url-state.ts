import { useEffect, useRef } from 'react';
import { useThemeStore } from '@/store/theme-store';
import { encodeState, decodeState } from '@/lib/url-state';

export function useUrlState() {
  const store = useThemeStore();
  const initialized = useRef(false);

  // On mount: read hash and apply to store
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const decoded = decodeState(hash);
      if (decoded) {
        store.setFullState(decoded);
      }
    }
    initialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On state change: write hash
  useEffect(() => {
    if (!initialized.current) return;
    const encoded = encodeState(store);
    history.replaceState(null, '', '#' + encoded);
  }, [
    store.brandHex, store.bgColorHex, store.bgAutoMatch,
    store.errorColorHex, store.errorAutoMatch, store.chromaScale,
    store.currentMode, store.brandPin, store.errorPin,
    store.fgContrastMode, store.themeName, store.extraAccents,
  ]);
}
