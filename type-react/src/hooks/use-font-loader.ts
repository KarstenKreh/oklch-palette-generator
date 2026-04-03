import { useEffect } from 'react';
import { buildFontshareUrl, FONT_CATALOG } from '@/lib/fontshare';

const LINK_ID = 'fontshare-catalog';

/**
 * Loads ALL catalog fonts via a single Fontshare CSS link.
 * The CSS file is small (@font-face declarations only).
 * Actual font files are downloaded lazily by the browser
 * when text is rendered in a given font.
 */
export function useFontLoader() {
  useEffect(() => {
    const allSlugs = FONT_CATALOG.map((f) => f.slug);
    const url = buildFontshareUrl(allSlugs);
    if (!url) return;

    let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = LINK_ID;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = url;
  }, []);
}
