/**
 * Fontshare font catalog and CDN URL builder.
 *
 * Fetches the full font list from the Fontshare API (~100 fonts).
 * Falls back to a small static seed so the UI is never empty.
 * Fonts are loaded on-demand via the Fontshare CSS API.
 */

export interface FontEntry {
  slug: string;
  name: string;
  category: 'sans' | 'serif' | 'mono' | 'display';
  fallback: string;
}

// ── Mono fonts (not on Fontshare — always included) ─────────────

const MONO_FONTS: FontEntry[] = [
  { slug: 'jet-brains-mono', name: 'JetBrains Mono', category: 'mono', fallback: 'monospace' },
  { slug: 'fira-code', name: 'Fira Code', category: 'mono', fallback: 'monospace' },
];

// ── Minimal seed catalog (used until API responds) ──────────────

const SEED_CATALOG: FontEntry[] = [
  { slug: 'satoshi', name: 'Satoshi', category: 'sans', fallback: 'sans-serif' },
  { slug: 'general-sans', name: 'General Sans', category: 'sans', fallback: 'sans-serif' },
  { slug: 'zodiak', name: 'Zodiak', category: 'serif', fallback: 'serif' },
  { slug: 'clash-display', name: 'Clash Display', category: 'display', fallback: 'sans-serif' },
  ...MONO_FONTS,
];

// ── Dynamic catalog (populated from API) ────────────────────────

let catalog: FontEntry[] = [...SEED_CATALOG];
let catalogMap = new Map(catalog.map((f) => [f.slug, f]));
let fetchPromise: Promise<FontEntry[]> | null = null;
let listeners: Array<() => void> = [];

function rebuildMap() {
  catalogMap = new Map(catalog.map((f) => [f.slug, f]));
}

const CATEGORY_MAP: Record<string, FontEntry['category']> = {
  Sans: 'sans',
  Serif: 'serif',
  Display: 'display',
  Mono: 'mono',
  Handwritten: 'display', // treat handwritten as display
};

const FALLBACK_MAP: Record<FontEntry['category'], string> = {
  sans: 'sans-serif',
  serif: 'serif',
  display: 'sans-serif',
  mono: 'monospace',
};

interface FontshareApiFont {
  name: string;
  slug: string;
  category: string;
}

interface FontshareApiResponse {
  fonts: FontshareApiFont[];
}

export function fetchFontCatalog(): Promise<FontEntry[]> {
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('https://api.fontshare.com/v2/fonts')
    .then((r) => r.json())
    .then((data: FontshareApiResponse) => {
      const entries: FontEntry[] = data.fonts.map((f) => {
        const cat = CATEGORY_MAP[f.category] ?? 'sans';
        return {
          slug: f.slug,
          name: f.name,
          category: cat,
          fallback: FALLBACK_MAP[cat],
        };
      });
      // Sort alphabetically, then append mono fonts (not on Fontshare)
      entries.sort((a, b) => a.name.localeCompare(b.name));
      catalog = [...entries, ...MONO_FONTS];
      rebuildMap();
      // Notify subscribers
      listeners.forEach((fn) => fn());
      return catalog;
    })
    .catch(() => {
      // On error, keep the seed catalog
      return catalog;
    });

  return fetchPromise;
}

/** Subscribe to catalog updates (for React useSyncExternalStore). */
export function subscribeCatalog(callback: () => void): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((fn) => fn !== callback);
  };
}

/** Get the current catalog snapshot. */
export function getCatalog(): FontEntry[] {
  return catalog;
}

// ── Lookups ─────────────────────────────────────────────────────

export function getFontEntry(slug: string): FontEntry | undefined {
  return catalogMap.get(slug);
}

export function fontFamily(slug: string): string {
  const entry = catalogMap.get(slug);
  if (!entry) return 'sans-serif';
  return `'${entry.name}', ${entry.fallback}`;
}

// ── URL builders ────────────────────────────────────────────────

export function buildFontshareUrl(slugs: string[]): string {
  const unique = [...new Set(slugs.filter(Boolean))];
  if (unique.length === 0) return '';
  const params = unique.map((s) => `f[]=${s}@1,2`).join('&');
  return `https://api.fontshare.com/v2/css?${params}&display=swap`;
}

export function buildFontshareEmbed(slugs: string[]): string {
  const lines: string[] = [];

  // Fontshare fonts
  const fontshareSlugs = slugs.filter((s) => !GOOGLE_FONT_SLUGS[s]);
  const fontshareUrl = buildFontshareUrl(fontshareSlugs);
  if (fontshareUrl) lines.push(`<link href="${fontshareUrl}" rel="stylesheet">`);

  // Google Fonts (mono)
  const googleSlugs = slugs.filter((s) => GOOGLE_FONT_SLUGS[s]);
  if (googleSlugs.length) {
    const families = googleSlugs.map((s) => `family=${GOOGLE_FONT_SLUGS[s]}:wght@300;400;500;600;700`).join('&');
    lines.push(`<link href="https://fonts.googleapis.com/css2?${families}&display=swap" rel="stylesheet">`);
  }

  return lines.join('\n');
}

// ── On-demand font loading ──────────────────────────────────────

const loadedSlugs = new Set<string>();

// Mono fonts are not on Fontshare — load from Google Fonts
const GOOGLE_FONT_SLUGS: Record<string, string> = {
  'jet-brains-mono': 'JetBrains+Mono',
  'fira-code': 'Fira+Code',
};

export function loadFont(slug: string): void {
  if (loadedSlugs.has(slug)) return;
  loadedSlugs.add(slug);

  const linkId = `font-${slug}`;
  if (document.getElementById(linkId)) return;

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';

  const googleName = GOOGLE_FONT_SLUGS[slug];
  if (googleName) {
    link.href = `https://fonts.googleapis.com/css2?family=${googleName}:wght@300;400;500;600;700&display=swap`;
  } else {
    link.href = `https://api.fontshare.com/v2/css?f[]=${slug}@1,2&display=swap`;
  }

  document.head.appendChild(link);
}

// ── Grouped for selector ────────────────────────────────────────

export function fontsByCategory(): Record<string, FontEntry[]> {
  const groups: Record<string, FontEntry[]> = {};
  for (const font of catalog) {
    if (!groups[font.category]) groups[font.category] = [];
    groups[font.category].push(font);
  }
  return groups;
}
