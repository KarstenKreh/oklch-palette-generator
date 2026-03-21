// ================================================================
//  Code block rendering (OKLCH, Hex, Semantic export)
// ================================================================

import { hexToOklch, contrastRatio } from './color-math.js';
import { state } from './state.js';

function generateShadowTokens(bgHex, isDark) {
  const PHI = 1.618033988749895;
  const SQRT_PHI = Math.sqrt(PHI);
  const [bgL, , surfaceHue] = hexToOklch(bgHex);

  const shadowL = isDark ? 0.02 : 0.05;
  const shadowC = isDark ? 0.005 : 0.01;
  const H = surfaceHue.toFixed(2);

  const alphaMultiplier = 0.12 / (bgL + 0.1);

  const levels = [
    { name: 'xs', factor: 1 / PHI },
    { name: 'sm', factor: 1 / SQRT_PHI },
    { name: 'md', factor: 1 },
    { name: 'lg', factor: SQRT_PHI },
    { name: 'xl', factor: PHI },
  ];

  return levels.map(({ name, factor }) => {
    const oY = factor;
    const a1 = (0.06 * factor * alphaMultiplier).toFixed(3);
    const a2 = (0.04 * factor * alphaMultiplier).toFixed(3);
    const b1 = (factor * 0.6).toFixed(3);
    const b2 = (factor * 2.0).toFixed(3);
    const shadow =
      `0 ${(oY * 0.4).toFixed(3)}rem ${b1}rem oklch(${shadowL} ${shadowC} ${H} / ${a1}), ` +
      `0 ${oY.toFixed(3)}rem ${b2}rem oklch(${shadowL} ${shadowC} ${H} / ${a2})`;
    return [`shadow-${name}`, '#direct', shadow];
  });
}

export function fmtSec(palette, prefix, mode) {
  const gs = [
    { l: 'Light Surfaces', f: r => r.step <= 100 },
    { l: 'Core', f: r => r.step >= 200 && r.step <= 800 },
    { l: 'Dark Surfaces (normal)', f: r => r.step >= 825 && r.step <= 875 },
    { l: 'Dark Surfaces (high contrast)', f: r => r.step >= 900 },
  ];
  let out = '';
  gs.forEach((g, i) => {
    if (i > 0) out += '\n';
    out += `  <span class="cmt">/* ${g.l} */</span>\n`;
    palette.filter(g.f).forEach(r => {
      const v = mode === 'css' ? r.css : r.hex;
      out += `  <span class="prop">--color-${prefix}-${r.step}</span>: <span class="val">${v}</span>;\n`;
    });
  });
  return out;
}

export function renderSemantic(accentPalettes = [], pinOpts = {}, brandPal = [], errPal = [], errSurfPal = [], surfacePal = []) {
  const { brandPin: bPin, pinnedBrandHex: bHex, errorPin: ePin, pinnedErrorHex: eHex } = pinOpts;
  const prop = name => `  <span class="prop">--${name}</span>`;
  const ref  = (prefix, step) => `<span class="val">var(--color-${prefix}-${step})</span>`;
  const val  = v => `<span class="val">${v}</span>`;
  const line = (name, prefix, step) => `${prop(name)}: ${ref(prefix, step)};\n`;
  const cmt  = t => `  <span class="cmt">/* ${t} */</span>\n`;
  const hexToCss = hex => { const [L,C,H] = hexToOklch(hex); return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(2)})`; };
  const palMap = arr => Object.fromEntries(arr.map(r => [r.step, r]));
  const fgDirect = (bgHex, pMap, ls, ds, pfx) => { const lightHex = pMap[ls]?.hex; const step = (lightHex && contrastRatio(lightHex, bgHex) >= 4.5) ? ls : ds; return pMap[step]?.css || `var(--color-${pfx}-${step})`; };
  const fgStep = (bgHex, pMap, ls, ds) => { const lightHex = pMap[ls]?.hex; return (lightHex && contrastRatio(lightHex, bgHex) >= 4.5) ? ls : ds; };
  const brandMap   = palMap(brandPal);
  const errMap     = palMap(errPal);
  const errSurfMap = palMap(errSurfPal);
  const surfMap    = palMap(surfacePal);

  const block = (sel, rows) => {
    let o = `${sel} {\n`;
    rows.forEach(([name, prefix, step]) => {
      if (prefix === null) o += cmt(step);
      else if (prefix === '#direct') o += `${prop(name)}: ${val(step)};\n`;
      else o += line(name, prefix, step);
    });
    return o + `}\n`;
  };

  // Brand pin helpers
  const bCss  = bPin && bHex ? hexToCss(bHex) : null;
  const bFgCss = bPin && bHex ? fgDirect(bHex, brandMap, 50, 975, 'brand') : null;
  const primaryLight   = bPin && bHex ? ['primary',                      '#direct', bCss]   : ['primary',                      'brand', 600];
  const primaryFgLight = bPin && bHex ? ['primary-foreground',            '#direct', bFgCss] : ['primary-foreground',            'brand', fgStep(brandMap[600]?.hex, brandMap, 50, 975)];
  const primaryDark    = bPin && bHex ? ['primary',                      '#direct', bCss]   : ['primary',                      'brand', 400];
  const primaryFgDark  = bPin && bHex ? ['primary-foreground',            '#direct', bFgCss] : ['primary-foreground',            'brand', fgStep(brandMap[400]?.hex, brandMap, 50, 975)];
  const sbPrimLight    = bPin && bHex ? ['sidebar-primary',              '#direct', bCss]   : ['sidebar-primary',              'brand', 600];
  const sbPrimFgLight  = bPin && bHex ? ['sidebar-primary-foreground',   '#direct', bFgCss] : ['sidebar-primary-foreground',   'brand', fgStep(brandMap[600]?.hex, brandMap, 50, 975)];
  const sbPrimDark     = bPin && bHex ? ['sidebar-primary',              '#direct', bCss]   : ['sidebar-primary',              'brand', 400];
  const sbPrimFgDark   = bPin && bHex ? ['sidebar-primary-foreground',   '#direct', bFgCss] : ['sidebar-primary-foreground',   'brand', fgStep(brandMap[400]?.hex, brandMap, 50, 975)];

  // Error pin helpers
  const eCss  = ePin && eHex ? hexToCss(eHex) : null;
  const eFgCss = ePin && eHex ? fgDirect(eHex, errSurfMap, 100, 900, 'error-surface') : null;
  const destLight   = ePin && eHex ? ['destructive',            '#direct', eCss]   : ['destructive',            'error', 600];
  const destFgLight = ePin && eHex ? ['destructive-foreground', '#direct', eFgCss] : ['destructive-foreground', 'error-surface', fgStep(errMap[600]?.hex, errSurfMap, 100, 900)];
  const destDark    = ePin && eHex ? ['destructive',            '#direct', eCss]   : ['destructive',            'error', 400];
  const destFgDark  = ePin && eHex ? ['destructive-foreground', '#direct', eFgCss] : ['destructive-foreground', 'error-surface', fgStep(errMap[400]?.hex, errSurfMap, 100, 900)];

  const root = block(':root', [
    [null,    null,             'Base'],
    ['background',              'surface', 50],
    ['foreground',              'surface', 975],
    [null,    null,             'Card'],
    ['card',                    'surface', 25],
    ['card-foreground',         'surface', 975],
    [null,    null,             'Popover'],
    ['popover',                 'surface', 25],
    ['popover-foreground',      'surface', 975],
    [null,    null,             'Primary'],
    primaryLight,
    primaryFgLight,
    [null,    null,             'Secondary — softened brand'],
    ['secondary',               'brand',   300],
    ['secondary-foreground',    'brand',   fgStep(brandMap[300]?.hex, brandMap, 100, 900)],
    [null,    null,             'Muted'],
    ['muted',                   'surface', 75],
    ['muted-foreground',        'surface', 700],
    [null,    null,             'Accent'],
    ['accent',                  'brand',   100],
    ['accent-foreground',       'brand',   fgStep(brandMap[100]?.hex, brandMap, 50, 950)],
    [null,    null,             'Destructive'],
    destLight,
    destFgLight,
    [null,    null,             'Border / Input / Ring'],
    ['border',                  'surface', 300],
    ['border-muted',            'surface', 200],
    ['input',                   'surface', 300],
    ['ring',                    'surface', 400],
    [null,    null,             'Shadows'],
    ...generateShadowTokens(surfMap[50]?.hex || '#F8F8F8', false),
    [null,    null,             'Sidebar'],
    ['sidebar',                      'surface', 25],
    ['sidebar-foreground',           'surface', 975],
    sbPrimLight,
    sbPrimFgLight,
    ['sidebar-accent',               'brand',   100],
    ['sidebar-accent-foreground',    'brand',   fgStep(brandMap[100]?.hex, brandMap, 50, 950)],
    ['sidebar-border',               'surface', 300],
    ['sidebar-ring',                 'surface', 400],
  ]);

  const dark = block('.dark', [
    [null,    null,             'Base'],
    ['background',              'surface', 875],
    ['foreground',              'surface', 25],
    [null,    null,             'Card'],
    ['card',                    'surface', 825],
    ['card-foreground',         'surface', 25],
    [null,    null,             'Popover'],
    ['popover',                 'surface', 800],
    ['popover-foreground',      'surface', 25],
    [null,    null,             'Primary'],
    primaryDark,
    primaryFgDark,
    [null,    null,             'Secondary — softened brand'],
    ['secondary',               'brand',   700],
    ['secondary-foreground',    'brand',   fgStep(brandMap[700]?.hex, brandMap, 100, 900)],
    [null,    null,             'Muted'],
    ['muted',                   'surface', 850],
    ['muted-foreground',        'surface', 300],
    [null,    null,             'Accent'],
    ['accent',                  'brand',   800],
    ['accent-foreground',       'brand',   fgStep(brandMap[800]?.hex, brandMap, 50, 950)],
    [null,    null,             'Destructive'],
    destDark,
    destFgDark,
    [null,    null,             'Border / Input / Ring'],
    ['border',                  'surface', 600],
    ['border-muted',            'surface', 700],
    ['input',                   'surface', 700],
    ['ring',                    'surface', 500],
    [null,    null,             'Shadows'],
    ...generateShadowTokens(surfMap[875]?.hex || '#1A1A1A', true),
    [null,    null,             'Sidebar'],
    ['sidebar',                      'surface', 875],
    ['sidebar-foreground',           'surface', 25],
    sbPrimDark,
    sbPrimFgDark,
    ['sidebar-accent',               'brand',   800],
    ['sidebar-accent-foreground',    'brand',   fgStep(brandMap[800]?.hex, brandMap, 50, 950)],
    ['sidebar-border',               'surface', 600],
    ['sidebar-ring',                 'surface', 500],
  ]);

  let accentBlocks = '';
  accentPalettes.forEach(entry => {
    const n = entry.cssName;
    const aPin  = !!entry.pin;
    const aHex  = entry.hex;
    const aCss  = aPin ? hexToCss(aHex) : null;
    const aMap  = palMap(entry.palette || []);
    const aFgCss = aPin ? fgDirect(aHex, aMap, 50, 975, n) : null;
    const aLight  = aPin ? [`${n}`, '#direct', aCss]   : [`${n}`, n, 600];
    const aFgL    = aPin ? [`${n}-foreground`, '#direct', aFgCss] : [`${n}-foreground`, n, fgStep(aMap[600]?.hex, aMap, 50, 975)];
    const aDark   = aPin ? [`${n}`, '#direct', aCss]   : [`${n}`, n, 400];
    const aFgD    = aPin ? [`${n}-foreground`, '#direct', aFgCss] : [`${n}-foreground`, n, fgStep(aMap[400]?.hex, aMap, 50, 975)];
    const accentRoot = block(`:root`, [
      [null,                           null, `${entry.name} — light`],
      aLight,
      aFgL,
      [null,                           null, 'Background / Card / Popover'],
      [`${n}-background`,              `${n}-surface`, 50],
      [`${n}-background-foreground`,   `${n}-surface`, 975],
      [`${n}-card`,                    `${n}-surface`, 25],
      [`${n}-card-foreground`,         `${n}-surface`, 975],
      [`${n}-popover`,                 `${n}-surface`, 25],
      [`${n}-popover-foreground`,      `${n}-surface`, 975],
      [null,                           null, 'Secondary'],
      [`${n}-secondary`,               n, 300],
      [`${n}-secondary-foreground`,    n, 900],
      [null,                           null, 'Muted / Subtle / Accent'],
      [`${n}-muted`,                   `${n}-surface`, 75],
      [`${n}-muted-foreground`,        `${n}-surface`, 700],
      [`${n}-accent`,                  n, 100],
      [`${n}-accent-foreground`,       n, 950],
      [`${n}-subtle`,                  n, 100],
      [`${n}-subtle-foreground`,       n, 950],
      [null,                           null, 'Border / Input / Ring'],
      [`${n}-border`,                  `${n}-surface`, 300],
      [`${n}-border-muted`,            `${n}-surface`, 200],
      [`${n}-input`,                   `${n}-surface`, 300],
      [`${n}-ring`,                    `${n}-surface`, 400],
    ]);
    const accentDark = block(`.dark`, [
      [null,                           null, `${entry.name} — dark`],
      aDark,
      aFgD,
      [null,                           null, 'Background / Card / Popover'],
      [`${n}-background`,              `${n}-surface`, 875],
      [`${n}-background-foreground`,   `${n}-surface`, 25],
      [`${n}-card`,                    `${n}-surface`, 825],
      [`${n}-card-foreground`,         `${n}-surface`, 25],
      [`${n}-popover`,                 `${n}-surface`, 800],
      [`${n}-popover-foreground`,      `${n}-surface`, 25],
      [null,                           null, 'Secondary'],
      [`${n}-secondary`,               n, 700],
      [`${n}-secondary-foreground`,    n, 100],
      [null,                           null, 'Muted / Subtle / Accent'],
      [`${n}-muted`,                   `${n}-surface`, 850],
      [`${n}-muted-foreground`,        `${n}-surface`, 300],
      [`${n}-accent`,                  n, 800],
      [`${n}-accent-foreground`,       n, 50],
      [`${n}-subtle`,                  n, 800],
      [`${n}-subtle-foreground`,       n, 50],
      [null,                           null, 'Border / Input / Ring'],
      [`${n}-border`,                  `${n}-surface`, 700],
      [`${n}-border-muted`,            `${n}-surface`, 700],
      [`${n}-input`,                   `${n}-surface`, 700],
      [`${n}-ring`,                    `${n}-surface`, 500],
    ]);
    accentBlocks += `\n<span class="cmt">/* ${entry.name} Accent — semantic tokens */</span>\n` + accentRoot + '\n' + accentDark;
  });

  return `<span class="cmt">/* Semantic Tokens — shadcn/ui compatible */</span>\n` + root + '\n' + dark + accentBlocks;
}

export function renderCodeBlocks(brand, bg, error, errorSlated, neutral, customBgHex = null, accentPalettes = [], brandPinActive = false, pinnedBrandHex = null, errorPinActive = false, pinnedErrorHex = null) {
  const pct = Math.round(state.chromaScale * 100);
  const bgLabel = customBgHex ? `${pct}% chroma — base ${customBgHex}` : `${pct}% chroma`;
  const neutralExt = [
    { step: 0,    L: 1, C: 0, H: 0, hex: '#FFFFFF', css: 'oklch(1 0 0)' },
    ...neutral,
    { step: 1000, L: 0, C: 0, H: 0, hex: '#000000', css: 'oklch(0 0 0)' }
  ];

  const cmt = t => `\n  <span class="cmt">/* ${t} */</span>\n`;

  // ── Primitives OKLCH ──
  const oklchBlock = document.getElementById('code-oklch');
  const btn1 = oklchBlock.querySelector('.copy-block-btn').outerHTML;
  let o = `<span class="cmt">/* Primitive Tokens */</span>\n:root {\n`;
  o += cmt('Brand') + fmtSec(brand, 'brand', 'css');
  o += cmt(`Surface — ${bgLabel}`) + fmtSec(bg, 'surface', 'css');
  o += cmt('Error') + fmtSec(error, 'error', 'css');
  o += cmt(`Error Surface — ${pct}% chroma`) + fmtSec(errorSlated, 'error-surface', 'css');
  o += cmt('Neutral') + fmtSec(neutralExt, 'neutral', 'css');
  accentPalettes.forEach(entry => {
    o += cmt(entry.name) + fmtSec(entry.palette, entry.cssName, 'css');
    o += cmt(`${entry.name} Surface — ${pct}% chroma`) + fmtSec(entry.slatedPalette, entry.cssName + '-surface', 'css');
  });
  o += `}`; oklchBlock.innerHTML = btn1 + o;

  // ── Primitives Hex ──
  const hexBlock = document.getElementById('code-hex');
  const btn2 = hexBlock.querySelector('.copy-block-btn').outerHTML;
  let h = `<span class="cmt">/* Primitive Tokens (Hex) */</span>\n:root {\n`;
  h += cmt('Brand') + fmtSec(brand, 'brand', 'hex');
  h += cmt(`Surface — ${bgLabel}`) + fmtSec(bg, 'surface', 'hex');
  h += cmt('Error') + fmtSec(error, 'error', 'hex');
  h += cmt(`Error Surface — ${pct}% chroma`) + fmtSec(errorSlated, 'error-surface', 'hex');
  h += cmt('Neutral') + fmtSec(neutralExt, 'neutral', 'hex');
  accentPalettes.forEach(entry => {
    h += cmt(entry.name) + fmtSec(entry.palette, entry.cssName, 'hex');
    h += cmt(`${entry.name} Surface — ${pct}% chroma`) + fmtSec(entry.slatedPalette, entry.cssName + '-surface', 'hex');
  });
  h += `}`; hexBlock.innerHTML = btn2 + h;

  // ── Semantic ──
  const semBlock = document.getElementById('code-semantic');
  const btn3 = semBlock.querySelector('.copy-block-btn').outerHTML;
  semBlock.innerHTML = btn3 + renderSemantic(accentPalettes, { brandPin: brandPinActive, pinnedBrandHex, errorPin: errorPinActive, pinnedErrorHex }, brand, error, errorSlated, bg);
}
