/**
 * Fontshare font catalog and CDN URL builder.
 *
 * Fetches the full font list from the Fontshare API (~100 fonts).
 * Falls back to a small static seed so the UI is never empty.
 * Fonts are loaded on-demand via the Fontshare CSS API.
 *
 * Mono fonts use system font stacks (no external loading needed).
 */

export interface FontEntry {
  slug: string;
  name: string;
  category: 'sans' | 'serif' | 'mono' | 'display';
  fallback: string;
  /** True for system fonts that need no external loading */
  isSystem?: boolean;
}

// ── Mono fonts (system stacks — no external service) ────────────

const MONO_FONTS: FontEntry[] = [
  { slug: 'system-mono', name: 'System Default', category: 'mono', fallback: 'monospace', isSystem: true },
  { slug: 'consolas', name: 'Consolas', category: 'mono', fallback: 'monospace', isSystem: true },
  { slug: 'sf-mono', name: 'SF Mono', category: 'mono', fallback: 'monospace', isSystem: true },
];

// System mono stacks — mapped by slug
const SYSTEM_MONO_STACKS: Record<string, string> = {
  'system-mono': "ui-monospace, 'Cascadia Code', Consolas, 'SF Mono', Menlo, 'DejaVu Sans Mono', monospace",
  'consolas': "Consolas, 'Cascadia Code', 'DejaVu Sans Mono', monospace",
  'sf-mono': "'SF Mono', Menlo, 'DejaVu Sans Mono', monospace",
};

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

  const apiUrl = import.meta.env.DEV
    ? 'https://api.fontshare.com/v2/fonts'
    : '/api/fonts';

  fetchPromise = fetch(apiUrl)
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
      // Sort alphabetically, then append system mono fonts
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
  // System mono fonts have their own stacks
  const monoStack = SYSTEM_MONO_STACKS[slug];
  if (monoStack) return monoStack;

  const entry = catalogMap.get(slug);
  if (!entry) return 'sans-serif';
  return `'${entry.name}', ${entry.fallback}`;
}

// ── URL builders ────────────────────────────────────────────────

export function buildFontshareUrl(slugs: string[]): string {
  // Filter out system fonts — they don't need loading
  const unique = [...new Set(slugs.filter((s) => !SYSTEM_MONO_STACKS[s] && s))];
  if (unique.length === 0) return '';
  const params = unique.map((s) => `f[]=${s}@1,2`).join('&');
  return `https://api.fontshare.com/v2/css?${params}&display=swap`;
}

export function buildFontshareEmbed(slugs: string[]): string {
  const url = buildFontshareUrl(slugs);
  if (!url) return '';
  return `<link href="${url}" rel="stylesheet">`;
}

// ── On-demand font loading ──────────────────────────────────────

const loadedSlugs = new Set<string>();

export function loadFont(slug: string): void {
  // System fonts need no loading
  if (SYSTEM_MONO_STACKS[slug]) return;

  if (loadedSlugs.has(slug)) return;
  loadedSlugs.add(slug);

  const linkId = `font-${slug}`;
  if (document.getElementById(linkId)) return;

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://api.fontshare.com/v2/css?f[]=${slug}@1,2&display=swap`;
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
