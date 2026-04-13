// Code export — generates CSS custom property strings

import { hexToOklch, contrastRatio, invertHex } from '@core/color-math';
import { generateShadowValues } from '@core/shadows';
import type { PaletteEntry } from '@core/palette';
import type { FgContrastMode } from '@core/url-state/color';

export interface AccentPalette {
  name: string;
  hex: string;
  cssName: string;
  palette: PaletteEntry[];
  slatedPalette: PaletteEntry[];
  pin: boolean;
  invert: boolean;
}

interface PaletteMap { [step: number]: PaletteEntry }

function palMap(arr: PaletteEntry[]): PaletteMap {
  return Object.fromEntries(arr.map(r => [r.step, r]));
}

function fgStep(bgHex: string | undefined, pMap: PaletteMap, ls: number, ds: number, fgMode: FgContrastMode): number {
  if (!bgHex) return ls;
  const lightHex = pMap[ls]?.hex;
  const darkHex = pMap[ds]?.hex;
  const lightCR = lightHex ? contrastRatio(lightHex, bgHex) : 0;
  const darkCR = darkHex ? contrastRatio(darkHex, bgHex) : 0;
  if (fgMode === 'preferDark') {
    if (darkCR >= 4.5) return ds;          // preferred passes → use it
    if (lightCR >= 4.5) return ls;         // only other passes → use other
    return ds;                              // neither passes → honor preference
  }
  if (fgMode === 'preferLight') {
    if (lightCR >= 4.5) return ls;         // preferred passes → use it
    if (darkCR >= 4.5) return ds;          // only other passes → use other
    return ls;                              // neither passes → honor preference
  }
  return lightCR >= darkCR ? ls : ds;
}

function fgDirect(bgHex: string, pMap: PaletteMap, ls: number, ds: number, pfx: string, fgMode: FgContrastMode): string {
  const step = fgStep(bgHex, pMap, ls, ds, fgMode);
  return pMap[step]?.css || `var(--color-${pfx}-${step})`;
}

function hexToCss(hex: string): string {
  const [L, C, H] = hexToOklch(hex);
  return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(2)})`;
}

// Generate primitive token section for a palette
function fmtSec(palette: PaletteEntry[], prefix: string, mode: 'css' | 'hex'): string {
  const gs = [
    { l: 'Light Surfaces', f: (r: PaletteEntry) => r.step <= 100 },
    { l: 'Core', f: (r: PaletteEntry) => r.step >= 200 && r.step <= 800 },
    { l: 'Dark Surfaces (normal)', f: (r: PaletteEntry) => r.step >= 825 && r.step <= 875 },
    { l: 'Dark Surfaces (high contrast)', f: (r: PaletteEntry) => r.step >= 900 },
  ];
  let out = '';
  gs.forEach((g, i) => {
    if (i > 0) out += '\n';
    out += `  /* ${g.l} */\n`;
    palette.filter(g.f).forEach(r => {
      const v = mode === 'css' ? r.css : r.hex;
      out += `  --color-${prefix}-${r.step}: ${v};\n`;
    });
  });
  return out;
}

type Row = [string, string | null, string | number];

function generateShadowTokens(bgHex: string, isDark: boolean): Row[] {
  return generateShadowValues(bgHex, isDark).map(({ name, shadow }) =>
    [`shadow-${name}`, '#direct', shadow] as Row
  );
}

function buildBlock(sel: string, rows: Row[]): string {
  let o = `${sel} {\n`;
  rows.forEach(([name, prefix, step]) => {
    if (name === '#comment') o += `  /* ${step} */\n`;
    else if (prefix === null) o += `  /* ${step} */\n`;
    else if (prefix === '#direct') o += `  --${name}: ${step};\n`;
    else o += `  --${name}: var(--color-${prefix}-${step});\n`;
  });
  return o + `}\n`;
}

// Generate primitives OKLCH block
export function generatePrimitivesOklch(
  brand: PaletteEntry[], surface: PaletteEntry[], error: PaletteEntry[],
  errorSurface: PaletteEntry[], neutralExtended: PaletteEntry[],
  accentPalettes: AccentPalette[], chromaScale: number, customBgHex: string | null,
  themeName: string
): string {
  const pct = Math.round(chromaScale * 100);
  const bgLabel = customBgHex ? `${pct}% chroma — base ${customBgHex}` : `${pct}% chroma`;
  const header = themeName ? `/* ${themeName} — Primitive Tokens */` : `/* Primitive Tokens */`;
  const cmt = (t: string) => `\n  /* ${t} */\n`;

  let o = `${header}\n:root {\n`;
  o += cmt('Brand') + fmtSec(brand, 'brand', 'css');
  o += cmt(`Surface — ${bgLabel}`) + fmtSec(surface, 'surface', 'css');
  o += cmt('Error') + fmtSec(error, 'error', 'css');
  o += cmt(`Error Surface — ${pct}% chroma`) + fmtSec(errorSurface, 'error-surface', 'css');
  o += cmt('Neutral') + fmtSec(neutralExtended, 'neutral', 'css');
  accentPalettes.forEach(entry => {
    o += cmt(entry.name) + fmtSec(entry.palette, entry.cssName, 'css');
    o += cmt(`${entry.name} Surface — ${pct}% chroma`) + fmtSec(entry.slatedPalette, entry.cssName + '-surface', 'css');
  });
  o += `}`;
  return o;
}

// Generate primitives Hex block
export function generatePrimitivesHex(
  brand: PaletteEntry[], surface: PaletteEntry[], error: PaletteEntry[],
  errorSurface: PaletteEntry[], neutralExtended: PaletteEntry[],
  accentPalettes: AccentPalette[], chromaScale: number, customBgHex: string | null,
  themeName: string
): string {
  const pct = Math.round(chromaScale * 100);
  const bgLabel = customBgHex ? `${pct}% chroma — base ${customBgHex}` : `${pct}% chroma`;
  const header = themeName ? `/* ${themeName} — Primitive Tokens (Hex) */` : `/* Primitive Tokens (Hex) */`;
  const cmt = (t: string) => `\n  /* ${t} */\n`;

  let h = `${header}\n:root {\n`;
  h += cmt('Brand') + fmtSec(brand, 'brand', 'hex');
  h += cmt(`Surface — ${bgLabel}`) + fmtSec(surface, 'surface', 'hex');
  h += cmt('Error') + fmtSec(error, 'error', 'hex');
  h += cmt(`Error Surface — ${pct}% chroma`) + fmtSec(errorSurface, 'error-surface', 'hex');
  h += cmt('Neutral') + fmtSec(neutralExtended, 'neutral', 'hex');
  accentPalettes.forEach(entry => {
    h += cmt(entry.name) + fmtSec(entry.palette, entry.cssName, 'hex');
    h += cmt(`${entry.name} Surface — ${pct}% chroma`) + fmtSec(entry.slatedPalette, entry.cssName + '-surface', 'hex');
  });
  h += `}`;
  return h;
}

// Generate semantic tokens block
export function generateSemantic(
  accentPalettes: AccentPalette[],
  brandPal: PaletteEntry[], errPal: PaletteEntry[], errSurfPal: PaletteEntry[], surfacePal: PaletteEntry[],
  brandPin: boolean, pinnedBrandHex: string | null, brandInvert: boolean,
  errorPin: boolean, pinnedErrorHex: string | null, errorInvert: boolean,
  fgMode: FgContrastMode, themeName: string
): string {
  const brandMap = palMap(brandPal);
  const errMap = palMap(errPal);
  const errSurfMap = palMap(errSurfPal);
  const surfMap = palMap(surfacePal);

  const bPin = brandPin;
  const bHex = pinnedBrandHex;
  const ePin = errorPin;
  const eHex = pinnedErrorHex;

  // Brand pin
  const bCss = bPin && bHex ? hexToCss(bHex) : null;
  const bFgCss = bPin && bHex ? fgDirect(bHex, brandMap, 50, 975, 'brand', fgMode) : null;

  // Inverted brand for dark mode (lightness mirrored, hue/chroma preserved)
  const bInvHex = bPin && bHex && brandInvert ? invertHex(bHex) : null;
  const bInvCss = bInvHex ? hexToCss(bInvHex) : null;
  const bInvFgCss = bInvHex ? fgDirect(bInvHex, brandMap, 50, 975, 'brand', fgMode) : null;

  const primaryLight: Row   = bPin && bHex ? ['primary', '#direct', bCss!] : ['primary', 'brand', 600];
  const primaryFgLight: Row = bPin && bHex ? ['primary-foreground', '#direct', bFgCss!] : ['primary-foreground', 'brand', fgStep(brandMap[600]?.hex, brandMap, 50, 975, fgMode)];
  const primaryDark: Row    = bPin && bHex ? (bInvCss ? ['primary', '#direct', bInvCss] : ['primary', '#direct', bCss!]) : ['primary', 'brand', 400];
  const primaryFgDark: Row  = bPin && bHex ? (bInvFgCss ? ['primary-foreground', '#direct', bInvFgCss] : ['primary-foreground', '#direct', bFgCss!]) : ['primary-foreground', 'brand', fgStep(brandMap[400]?.hex, brandMap, 50, 975, fgMode)];
  const sbPrimLight: Row    = bPin && bHex ? ['sidebar-primary', '#direct', bCss!] : ['sidebar-primary', 'brand', 600];
  const sbPrimFgLight: Row  = bPin && bHex ? ['sidebar-primary-foreground', '#direct', bFgCss!] : ['sidebar-primary-foreground', 'brand', fgStep(brandMap[600]?.hex, brandMap, 50, 975, fgMode)];
  const sbPrimDark: Row     = bPin && bHex ? (bInvCss ? ['sidebar-primary', '#direct', bInvCss] : ['sidebar-primary', '#direct', bCss!]) : ['sidebar-primary', 'brand', 400];
  const sbPrimFgDark: Row   = bPin && bHex ? (bInvFgCss ? ['sidebar-primary-foreground', '#direct', bInvFgCss] : ['sidebar-primary-foreground', '#direct', bFgCss!]) : ['sidebar-primary-foreground', 'brand', fgStep(brandMap[400]?.hex, brandMap, 50, 975, fgMode)];

  // Contrast warning for pinned brand used as text color
  const brandContrastWarnLight: Row[] = [];
  const brandContrastWarnDark: Row[] = [];
  if (bPin && bHex) {
    const lightBg = surfMap[50]?.hex;
    const darkBg = surfMap[875]?.hex;
    const darkCheckHex = bInvHex || bHex;
    const lightFail = lightBg ? contrastRatio(bHex, lightBg) < 4.5 : false;
    const darkFail = darkBg ? contrastRatio(darkCheckHex, darkBg) < 4.5 : false;
    if (lightFail) {
      brandContrastWarnLight.push(['#comment', null,
        `⚠ Pinned primary has low contrast on light surfaces — do not use as text color. Use --foreground for text on light backgrounds.`]);
    }
    if (darkFail) {
      brandContrastWarnDark.push(['#comment', null,
        `⚠ Pinned primary has low contrast on dark surfaces — do not use as text color. Use --foreground for text on dark backgrounds.`]);
    }
  }

  // Error pin
  const eCss = ePin && eHex ? hexToCss(eHex) : null;
  const eFgCss = ePin && eHex ? fgDirect(eHex, errSurfMap, 100, 900, 'error-surface', fgMode) : null;
  const eInvHex = ePin && eHex && errorInvert ? invertHex(eHex) : null;
  const eInvCss = eInvHex ? hexToCss(eInvHex) : null;
  const eInvFgCss = eInvHex ? fgDirect(eInvHex, errSurfMap, 100, 900, 'error-surface', fgMode) : null;

  const destLight: Row   = ePin && eHex ? ['destructive', '#direct', eCss!] : ['destructive', 'error', 600];
  const destFgLight: Row = ePin && eHex ? ['destructive-foreground', '#direct', eFgCss!] : ['destructive-foreground', 'error-surface', fgStep(errMap[600]?.hex, errSurfMap, 100, 900, fgMode)];
  const destDark: Row    = ePin && eHex ? (eInvCss ? ['destructive', '#direct', eInvCss] : ['destructive', '#direct', eCss!]) : ['destructive', 'error', 400];
  const destFgDark: Row  = ePin && eHex ? (eInvFgCss ? ['destructive-foreground', '#direct', eInvFgCss] : ['destructive-foreground', '#direct', eFgCss!]) : ['destructive-foreground', 'error-surface', fgStep(errMap[400]?.hex, errSurfMap, 100, 900, fgMode)];

  const root = buildBlock(':root', [
    [null as unknown as string, null, 'Base'],
    ['background', 'surface', 50], ['foreground', 'surface', 975],
    [null as unknown as string, null, 'Card'],
    ['card', 'surface', 25], ['card-foreground', 'surface', 975],
    [null as unknown as string, null, 'Popover'],
    ['popover', 'surface', 25], ['popover-foreground', 'surface', 975],
    [null as unknown as string, null, 'Primary'],
    primaryLight, primaryFgLight,
    ...brandContrastWarnLight,
    [null as unknown as string, null, 'Secondary — softened brand'],
    ['secondary', 'brand', 200], ['secondary-foreground', 'brand', fgStep(brandMap[200]?.hex, brandMap, 100, 900, fgMode)],
    [null as unknown as string, null, 'Muted'],
    ['muted', 'surface', 75], ['muted-foreground', 'surface', 700],
    [null as unknown as string, null, 'Accent'],
    ['accent', 'brand', 100], ['accent-foreground', 'brand', fgStep(brandMap[100]?.hex, brandMap, 50, 950, fgMode)],
    [null as unknown as string, null, 'Destructive'],
    destLight, destFgLight,
    ['destructive-subtle', 'error', 100], ['destructive-subtle-foreground', 'error', 950],
    ['destructive-border', 'error-surface', 300],
    [null as unknown as string, null, 'Border / Input / Ring'],
    ['border', 'surface', 300], ['border-muted', 'surface', 200],
    ['input', 'surface', 300], ['ring', 'surface', 400],
    [null as unknown as string, null, 'Shadows'],
    ...generateShadowTokens(surfMap[50]?.hex || '#F8F8F8', false),
    [null as unknown as string, null, 'Sidebar'],
    ['sidebar', 'surface', 25], ['sidebar-foreground', 'surface', 975],
    sbPrimLight, sbPrimFgLight,
    ['sidebar-accent', 'brand', 100], ['sidebar-accent-foreground', 'brand', fgStep(brandMap[100]?.hex, brandMap, 50, 950, fgMode)],
    ['sidebar-border', 'surface', 300], ['sidebar-ring', 'surface', 400],
  ]);

  const dark = buildBlock('.dark', [
    [null as unknown as string, null, 'Base'],
    ['background', 'surface', 875], ['foreground', 'surface', 25],
    [null as unknown as string, null, 'Card'],
    ['card', 'surface', 825], ['card-foreground', 'surface', 25],
    [null as unknown as string, null, 'Popover'],
    ['popover', 'surface', 800], ['popover-foreground', 'surface', 25],
    [null as unknown as string, null, 'Primary'],
    primaryDark, primaryFgDark,
    ...brandContrastWarnDark,
    [null as unknown as string, null, 'Secondary — softened brand'],
    ['secondary', 'brand', 800], ['secondary-foreground', 'brand', fgStep(brandMap[800]?.hex, brandMap, 100, 900, fgMode)],
    [null as unknown as string, null, 'Muted'],
    ['muted', 'surface', 850], ['muted-foreground', 'surface', 300],
    [null as unknown as string, null, 'Accent'],
    ['accent', 'brand', 800], ['accent-foreground', 'brand', fgStep(brandMap[800]?.hex, brandMap, 50, 950, fgMode)],
    [null as unknown as string, null, 'Destructive'],
    destDark, destFgDark,
    ['destructive-subtle', 'error', 800], ['destructive-subtle-foreground', 'error', 50],
    ['destructive-border', 'error-surface', 700],
    [null as unknown as string, null, 'Border / Input / Ring'],
    ['border', 'surface', 600], ['border-muted', 'surface', 700],
    ['input', 'surface', 700], ['ring', 'surface', 500],
    [null as unknown as string, null, 'Shadows'],
    ...generateShadowTokens(surfMap[875]?.hex || '#1A1A1A', true),
    [null as unknown as string, null, 'Sidebar'],
    ['sidebar', 'surface', 875], ['sidebar-foreground', 'surface', 25],
    sbPrimDark, sbPrimFgDark,
    ['sidebar-accent', 'brand', 800], ['sidebar-accent-foreground', 'brand', fgStep(brandMap[800]?.hex, brandMap, 50, 950, fgMode)],
    ['sidebar-border', 'surface', 600], ['sidebar-ring', 'surface', 500],
  ]);

  let accentBlocks = '';
  accentPalettes.forEach(entry => {
    const n = entry.cssName;
    const aPin = !!entry.pin;
    const aInv = !!entry.invert;
    const aHex = entry.hex;
    const aCss = aPin ? hexToCss(aHex) : null;
    const aMap = palMap(entry.palette || []);
    const aFgCss = aPin ? fgDirect(aHex, aMap, 50, 975, n, fgMode) : null;
    const aInvHex = aPin && aInv ? invertHex(aHex) : null;
    const aInvCss = aInvHex ? hexToCss(aInvHex) : null;
    const aInvFgCss = aInvHex ? fgDirect(aInvHex, aMap, 50, 975, n, fgMode) : null;

    const aLight: Row = aPin ? [n, '#direct', aCss!] : [n, n, 600];
    const aFgL: Row = aPin ? [`${n}-foreground`, '#direct', aFgCss!] : [`${n}-foreground`, n, fgStep(aMap[600]?.hex, aMap, 50, 975, fgMode)];
    const aDark: Row = aPin ? (aInvCss ? [n, '#direct', aInvCss] : [n, '#direct', aCss!]) : [n, n, 400];
    const aFgD: Row = aPin ? (aInvFgCss ? [`${n}-foreground`, '#direct', aInvFgCss] : [`${n}-foreground`, '#direct', aFgCss!]) : [`${n}-foreground`, n, fgStep(aMap[400]?.hex, aMap, 50, 975, fgMode)];

    const accentRoot = buildBlock(':root', [
      [null as unknown as string, null, `${entry.name} — light`],
      aLight, aFgL,
      [null as unknown as string, null, 'Background / Card / Popover'],
      [`${n}-background`, `${n}-surface`, 50], [`${n}-background-foreground`, `${n}-surface`, 975],
      [`${n}-card`, `${n}-surface`, 25], [`${n}-card-foreground`, `${n}-surface`, 975],
      [`${n}-popover`, `${n}-surface`, 25], [`${n}-popover-foreground`, `${n}-surface`, 975],
      [null as unknown as string, null, 'Secondary'],
      [`${n}-secondary`, n, 200], [`${n}-secondary-foreground`, n, 900],
      [null as unknown as string, null, 'Muted / Subtle / Accent'],
      [`${n}-muted`, `${n}-surface`, 75], [`${n}-muted-foreground`, `${n}-surface`, 700],
      [`${n}-accent`, n, 100], [`${n}-accent-foreground`, n, 950],
      [`${n}-subtle`, n, 100], [`${n}-subtle-foreground`, n, 950],
      [null as unknown as string, null, 'Border / Input / Ring'],
      [`${n}-border`, `${n}-surface`, 300], [`${n}-border-muted`, `${n}-surface`, 200],
      [`${n}-input`, `${n}-surface`, 300], [`${n}-ring`, `${n}-surface`, 400],
    ]);
    const accentDark = buildBlock('.dark', [
      [null as unknown as string, null, `${entry.name} — dark`],
      aDark, aFgD,
      [null as unknown as string, null, 'Background / Card / Popover'],
      [`${n}-background`, `${n}-surface`, 875], [`${n}-background-foreground`, `${n}-surface`, 25],
      [`${n}-card`, `${n}-surface`, 825], [`${n}-card-foreground`, `${n}-surface`, 25],
      [`${n}-popover`, `${n}-surface`, 800], [`${n}-popover-foreground`, `${n}-surface`, 25],
      [null as unknown as string, null, 'Secondary'],
      [`${n}-secondary`, n, 800], [`${n}-secondary-foreground`, n, 100],
      [null as unknown as string, null, 'Muted / Subtle / Accent'],
      [`${n}-muted`, `${n}-surface`, 850], [`${n}-muted-foreground`, `${n}-surface`, 300],
      [`${n}-accent`, n, 800], [`${n}-accent-foreground`, n, 50],
      [`${n}-subtle`, n, 800], [`${n}-subtle-foreground`, n, 50],
      [null as unknown as string, null, 'Border / Input / Ring'],
      [`${n}-border`, `${n}-surface`, 700], [`${n}-border-muted`, `${n}-surface`, 700],
      [`${n}-input`, `${n}-surface`, 700], [`${n}-ring`, `${n}-surface`, 500],
    ]);
    accentBlocks += `\n/* ${entry.name} Accent — semantic tokens */\n` + accentRoot + '\n' + accentDark;
  });

  const header = themeName
    ? `/* ${themeName} — Semantic Tokens (shadcn/ui compatible) */\n`
    : `/* Semantic Tokens — shadcn/ui compatible */\n`;
  return header + root + '\n' + dark + accentBlocks;
}

// Generate LLM briefing — a human/LLM-readable usage guide for the theme
export function generateLlmBriefing(
  brandHex: string,
  effectiveBgHex: string,
  effectiveErrorHex: string,
  accentPalettes: AccentPalette[],
  chromaScale: number,
  mode: 'balanced' | 'exact',
  brandPin: boolean,
  errorPin: boolean,
  themeName: string,
  fgContrastMode: FgContrastMode,
): string {
  const pct = Math.round(chromaScale * 100);
  const title = themeName || 'Untitled Theme';

  const fgLabel = fgContrastMode === 'best' ? 'Best Contrast (auto)' :
    fgContrastMode === 'preferLight' ? 'Prefer Light' : 'Prefer Dark';

  const colorRows = [
    `| Brand | \`${brandHex}\` | \`--color-brand-*\` | Primary interactive color${brandPin ? ' (pinned)' : ''} |`,
    `| Surface | \`${effectiveBgHex}\` | \`--color-surface-*\` | Background/container tint at ${pct}% chroma |`,
    `| Error | \`${effectiveErrorHex}\` | \`--color-error-*\` | Destructive/alert color${errorPin ? ' (pinned)' : ''} |`,
    `| Neutral | derived | \`--color-neutral-*\` | 0% chroma variant for high-contrast surfaces |`,
    ...accentPalettes.map(a =>
      `| ${a.name} | \`${a.hex}\` | \`--color-${a.cssName}-*\` | Additional accent${a.pin ? ' (pinned)' : ''} |`
    ),
  ].join('\n');

  const pinnedNote = (brandPin || errorPin || accentPalettes.some(a => a.pin))
    ? `\n> **Pinned** means the exact input hex is used for primary/destructive button colors instead of the generated palette step (brand-600/400 or error-600/400).\n`
    : '';

  let pinnedContrastWarning = '';
  if (brandPin) {
    pinnedContrastWarning = `
> ⚠ **Contrast warning — pinned primary**: The pinned brand color (\`${brandHex}\`) may not have sufficient contrast (WCAG AA 4.5:1) against your surface backgrounds when used as a text color. **Do not use \`--primary\` for body text.** Use \`--foreground\` for general text. \`--primary-foreground\` is only for text on primary-colored backgrounds (e.g. buttons).
`;
  }

  return `# ${title} — Theme Briefing

All colors are generated in the **OKLCH** color space (perceptually uniform). Gamut mapping to sRGB is handled automatically — you never need to worry about out-of-gamut values.

## Seed Colors

| Role | Hex | CSS prefix | Notes |
|------|-----|------------|-------|
${colorRows}
${pinnedNote}${pinnedContrastWarning}
## Semantic Token Mapping

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| \`--background\` | surface-50 | surface-875 | Page background |
| \`--foreground\` | surface-975 | surface-25 | Primary text |
| \`--card\` | surface-25 | surface-825 | Card backgrounds |
| \`--popover\` | surface-25 | surface-800 | Popover/dropdown |
| \`--primary\` | brand-600 | brand-400 | Primary buttons, links |
| \`--secondary\` | brand-100 | brand-900 | Secondary buttons |
| \`--muted\` | surface-75 | surface-850 | Muted backgrounds |
| \`--accent\` | brand-100 | brand-800 | Subtle highlights |
| \`--destructive\` | error-600 | error-400 | Error/delete actions |
| \`--destructive-subtle\` | error-100 | error-800 | Inline errors, alert backgrounds |
| \`--destructive-border\` | error-surface-300 | error-surface-700 | Error borders |
| \`--border\` | surface-300 | surface-600 | Default borders |
| \`--border-muted\` | surface-100 | surface-800 | Subtle separators |
| \`--input\` | surface-300 | surface-700 | Input borders |
| \`--ring\` | surface-400 | surface-500 | Focus rings |
| \`--shadow-*\` | xs–xl | xs–xl | Hue-matched shadows |

### Sidebar

| Token | Light | Dark |
|-------|-------|------|
| \`--sidebar\` | surface-25 | surface-875 |
| \`--sidebar-primary\` | brand-600 | brand-400 |
| \`--sidebar-accent\` | brand-100 | brand-800 |
| \`--sidebar-border\` | surface-300 | surface-600 |

Every background token has a matching \`*-foreground\` counterpart. Always pair them.
${accentPalettes.length > 0 ? `
### Accent Scopes

Each accent color provides a full semantic scope:
${accentPalettes.map(a => `- **${a.name}** (\`--${a.cssName}\`): \`-foreground\`, \`-background\`, \`-card\`, \`-popover\`, \`-secondary\`, \`-muted\`, \`-accent\`, \`-subtle\`, \`-border\`, \`-border-muted\`, \`-input\`, \`-ring\` — each with light/dark variants.`).join('\n')}
` : ''}
## How to Use

1. **Use semantic tokens** (\`--primary\`, \`--background\`, etc.) in component code — never reference primitive step numbers directly.
2. **Tailwind**: All tokens are available as Tailwind utilities (\`bg-primary\`, \`text-foreground\`, \`border-border\`, etc.).
3. **Dark mode**: Add \`.dark\` to \`<html>\` or a container. All semantic tokens remap automatically.
4. **Borders**: Default to \`--border-muted\` for subtle separation. Use \`--border\` for visible borders (inputs, focused elements).
5. **Shadows**: \`--shadow-xs\` through \`--shadow-xl\` — hue-matched to the surface palette.
6. **Border-radius**: Base \`--radius: 0.625rem\`. Derived sizes: \`--radius-sm\` (0.6×) through \`--radius-4xl\` (2.6×).

## Primitive Scale Reference

Each color uses an 18-step scale: **25, 50, 75, 100, 200–800, 825, 850, 875, 900, 925, 950, 975**

- **25–100** — light surfaces (backgrounds, cards)
- **200–800** — core palette (buttons, text, accents)
- **825–875** — dark-mode surfaces
- **900–975** — high-contrast surfaces

Two variants per color:
- \`--color-{name}-{step}\` — full chroma (interactive elements)
- \`--color-{name}-surface-{step}\` — ${pct}% chroma (backgrounds, containers)

## Settings

- **Palette mode**: ${mode === 'balanced' ? 'Balanced midpoint' : 'Brand Centered'}
- **Foreground contrast**: ${fgLabel}
- **Surface chroma**: ${pct}%
`;
}
