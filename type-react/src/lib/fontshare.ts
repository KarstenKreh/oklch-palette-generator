/**
 * Fontshare font catalog and CDN URL builder.
 *
 * Curated list of popular Fontshare fonts, grouped by category.
 * Fonts are loaded via the Fontshare CSS API.
 */

export interface FontEntry {
  slug: string;
  name: string;
  category: 'sans' | 'serif' | 'mono' | 'display';
  fallback: string;
}

export const FONT_CATALOG: FontEntry[] = [
  // Sans
  { slug: 'satoshi', name: 'Satoshi', category: 'sans', fallback: 'sans-serif' },
  { slug: 'general-sans', name: 'General Sans', category: 'sans', fallback: 'sans-serif' },
  { slug: 'cabinet-grotesk', name: 'Cabinet Grotesk', category: 'sans', fallback: 'sans-serif' },
  { slug: 'clash-grotesk', name: 'Clash Grotesk', category: 'sans', fallback: 'sans-serif' },
  { slug: 'switzer', name: 'Switzer', category: 'sans', fallback: 'sans-serif' },
  { slug: 'supreme', name: 'Supreme', category: 'sans', fallback: 'sans-serif' },
  { slug: 'ranade', name: 'Ranade', category: 'sans', fallback: 'sans-serif' },
  { slug: 'archivo', name: 'Archivo', category: 'sans', fallback: 'sans-serif' },

  // Serif
  { slug: 'zodiak', name: 'Zodiak', category: 'serif', fallback: 'serif' },
  { slug: 'gambetta', name: 'Gambetta', category: 'serif', fallback: 'serif' },
  { slug: 'boska', name: 'Boska', category: 'serif', fallback: 'serif' },
  { slug: 'erode', name: 'Erode', category: 'serif', fallback: 'serif' },
  { slug: 'author', name: 'Author', category: 'serif', fallback: 'serif' },
  { slug: 'sentient', name: 'Sentient', category: 'serif', fallback: 'serif' },

  // Display
  { slug: 'clash-display', name: 'Clash Display', category: 'display', fallback: 'sans-serif' },
  { slug: 'panchang', name: 'Panchang', category: 'display', fallback: 'sans-serif' },
  { slug: 'chillax', name: 'Chillax', category: 'display', fallback: 'sans-serif' },
  { slug: 'nippo', name: 'Nippo', category: 'display', fallback: 'sans-serif' },

  // Mono
  { slug: 'jet-brains-mono', name: 'JetBrains Mono', category: 'mono', fallback: 'monospace' },
  { slug: 'fira-code', name: 'Fira Code', category: 'mono', fallback: 'monospace' },
];

const catalogMap = new Map(FONT_CATALOG.map((f) => [f.slug, f]));

export function getFontEntry(slug: string): FontEntry | undefined {
  return catalogMap.get(slug);
}

export function fontFamily(slug: string): string {
  const entry = catalogMap.get(slug);
  if (!entry) return 'sans-serif';
  return `'${entry.name}', ${entry.fallback}`;
}

/**
 * Build a Fontshare CSS API URL for the given font slugs.
 * Requests all available weights + italic.
 */
export function buildFontshareUrl(slugs: string[]): string {
  const unique = [...new Set(slugs.filter((s) => catalogMap.has(s)))];
  if (unique.length === 0) return '';

  const params = unique.map((s) => `f[]=${s}@1,2`).join('&');
  return `https://api.fontshare.com/v2/css?${params}&display=swap`;
}

/**
 * Build a Fontshare embed <link> tag for code export.
 */
export function buildFontshareEmbed(slugs: string[]): string {
  const url = buildFontshareUrl(slugs);
  if (!url) return '';
  return `<link href="${url}" rel="stylesheet">`;
}

/**
 * Group fonts by category for display in selectors.
 */
export function fontsByCategory(): Record<string, FontEntry[]> {
  const groups: Record<string, FontEntry[]> = {};
  for (const font of FONT_CATALOG) {
    if (!groups[font.category]) groups[font.category] = [];
    groups[font.category].push(font);
  }
  return groups;
}
