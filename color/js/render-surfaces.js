// ================================================================
//  Surface preview rendering
// ================================================================

import { contrastRatio } from './color-math.js';
import { buildAccentMiniCards } from './accents-tabs.js';

export function buildPanelSvg(idx) {
  const fid = `svg-ps-${idx}`;
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:130px;display:block;margin:0.5rem 0 0.75rem;">
    <defs>
      <filter id="${fid}" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="rgba(0,0,0,0.18)" flood-opacity="1"/>
      </filter>
    </defs>
    <circle cx="100" cy="100" r="75" fill="var(--svg-bg)"/>
    <g class="svg-anim-palette">
      <path d="M 60 135 C 50 95, 100 90, 130 100 C 150 105, 155 140, 135 155 C 110 170, 70 175, 60 135 Z" fill="var(--svg-srf-2)" filter="url(#${fid})"/>
      <path d="M 60 130 C 50 90, 100 85, 130 95 C 150 100, 155 135, 135 150 C 110 165, 70 170, 60 130 Z" fill="var(--svg-srf-1)"/>
      <circle cx="75" cy="137" r="9" fill="var(--svg-srf-2)"/>
      <circle cx="75" cy="135" r="9" fill="var(--svg-bg)"/>
      <ellipse cx="78" cy="115" rx="8" ry="5" fill="var(--svg-brand-1)" transform="rotate(-15 78 115)"/>
      <ellipse cx="98" cy="103" rx="8" ry="5.5" fill="var(--svg-brand-2)" transform="rotate(-5 98 103)"/>
      <ellipse cx="118" cy="104" rx="9" ry="6" fill="var(--svg-brand-3)" transform="rotate(10 118 104)"/>
      <ellipse cx="135" cy="120" rx="10" ry="6.5" fill="var(--svg-brand-4)" transform="rotate(30 135 120)"/>
    </g>
    <circle class="svg-anim-splash" cx="135" cy="120" r="10" fill="none" stroke="var(--svg-brand-4)" stroke-width="2"/>
    <circle class="svg-anim-splash" cx="135" cy="120" r="14" fill="none" stroke="var(--svg-brand-2)" stroke-width="1.5" style="animation-delay:0.1s"/>
    <g class="svg-anim-brush">
      <path d="M -4 -35 Q -8 -60 -3 -80 Q 0 -85 3 -80 Q 8 -60 4 -35 Z" fill="var(--svg-srf-3)"/>
      <path d="M 0 -35 Q -2 -60 0 -83 Q 6 -60 4 -35 Z" fill="var(--svg-srf-2)" opacity="0.4"/>
      <rect x="-5" y="-35" width="10" height="12" rx="1" fill="var(--svg-srf-2)"/>
      <line x1="-5" y1="-31" x2="5" y2="-31" stroke="var(--svg-srf-line)" stroke-width="1"/>
      <line x1="-5" y1="-27" x2="5" y2="-27" stroke="var(--svg-srf-line)" stroke-width="1"/>
      <path d="M -5 -23 C -10 -10 -5 -2 0 0 C 4 -2 8 -12 5 -23 Z" fill="var(--svg-bristle)"/>
      <path d="M -3.5 -12 C -5 -5 -2 -1 0 0 C 2 -1 5 -5 3.5 -12 Q 0 -9 -3.5 -12 Z" fill="var(--svg-brand-4)"/>
    </g>
  </svg>`;
}

export function renderSurfaces(containerId, palette, slatedPalette, neutral, accentSwatch, brandPalette, accentPalettes, errorPalette, errorSlatedPalette, errorSwatchOverride) {
  accentPalettes = accentPalettes || [];
  const s = {}; palette.forEach(r => s[r.step] = r);
  const n = {}; neutral.forEach(r => n[r.step] = r);
  const v = {}; brandPalette.forEach(r => v[r.step] = r);
  const e = {}; errorPalette.forEach(r => e[r.step] = r);
  const es = {}; errorSlatedPalette.forEach(r => es[r.step] = r);
  const btnBg  = accentSwatch.hex;
  const btnFg  = contrastRatio('#FFFFFF', accentSwatch.hex) >= 4.5 ? '#fff' : '#111';
  const errSwatch = errorSwatchOverride || e[500];
  const errBg  = errSwatch.hex;
  const errFg  = contrastRatio('#FFFFFF', errSwatch.hex) >= 4.5 ? '#fff' : '#111';
  const secLightBg = v[300].hex;
  const secLightFg = contrastRatio('#FFFFFF', v[300].hex) >= 4.5 ? '#fff' : '#111';
  const secDarkBg  = v[700].hex;
  const secDarkFg  = contrastRatio('#FFFFFF', v[700].hex) >= 4.5 ? '#fff' : '#111';
  const textLight = s[850].hex;
  const textDark  = s[75].hex;

  const makeBtns = (panelType) => {
    const secBg = (panelType === 'dark' || panelType === 'dark-hc') ? secDarkBg : secLightBg;
    const secFg = (panelType === 'dark' || panelType === 'dark-hc') ? secDarkFg : secLightFg;
    return `<div class="surface-btns">
      <div class="surface-btn" style="background:${btnBg};color:${btnFg}">Primary</div>
      <div class="surface-btn" style="background:${secBg};color:${secFg}">Secondary</div>
      <div class="surface-btn" style="background:${errBg};color:${errFg}">Error</div>
    </div>`;
  };

  const buildMutedCard = (panelType) => {
    let bgColor, fgColor, label;
    if (panelType === 'light')         { bgColor = s[75].hex;  fgColor = s[700].hex; label = 'Muted (75)'; }
    else if (panelType === 'dark')     { bgColor = s[850].hex; fgColor = s[300].hex; label = 'Muted (850)'; }
    else if (panelType === 'light-hc') { bgColor = n[75].hex;  fgColor = n[700].hex; label = 'Muted (n75)'; }
    else                               { bgColor = n[850].hex; fgColor = n[300].hex; label = 'Muted (n850)'; }
    return `<div class="surface-card" style="background:${bgColor};color:${fgColor}"><p><strong>${label}</strong> — muted token</p></div>`;
  };

  const buildErrorMiniCard = (panelType) => {
    let bgColor, borderColor, textColor, dotColor;
    if (panelType === 'light')         { bgColor = es[100].hex; borderColor = es[300].hex; textColor = es[800].hex; dotColor = e[600].hex; }
    else if (panelType === 'dark')     { bgColor = es[850].hex; borderColor = es[700].hex; textColor = es[100].hex; dotColor = e[400].hex; }
    else if (panelType === 'light-hc') { bgColor = '#ffffff';   borderColor = es[200].hex; textColor = es[900].hex; dotColor = e[700].hex; }
    else                               { bgColor = '#000000';   borderColor = es[800].hex; textColor = es[75].hex;  dotColor = e[300].hex; }
    return `<div class="accent-mini-card" style="background:${bgColor};border-color:${borderColor};color:${textColor}">
      <div class="accent-mini-card-dot" style="background:${dotColor}"></div>Error
    </div>`;
  };

  const lightVars = `--svg-bg:${s[200].hex};--svg-srf-1:${s[75].hex};--svg-srf-2:${s[300].hex};--svg-srf-3:${s[200].hex};--svg-srf-line:${s[400].hex};--svg-bristle:#fdfcfb;--svg-brand-1:${v[300].hex};--svg-brand-2:${v[400].hex};--svg-brand-3:${v[500].hex};--svg-brand-4:${v[600].hex}`;
  const darkVars  = `--svg-bg:${s[700].hex};--svg-srf-1:${s[500].hex};--svg-srf-2:${s[600].hex};--svg-srf-3:${s[500].hex};--svg-srf-line:${s[400].hex};--svg-bristle:#fdfcfb;--svg-brand-1:${v[300].hex};--svg-brand-2:${v[400].hex};--svg-brand-3:${v[500].hex};--svg-brand-4:${v[600].hex}`;
  const lhcVars   = `--svg-bg:${n[200].hex};--svg-srf-1:#ffffff;--svg-srf-2:${n[400].hex};--svg-srf-3:${n[300].hex};--svg-srf-line:${n[500].hex};--svg-bristle:#fdfcfb;--svg-brand-1:${v[400].hex};--svg-brand-2:${v[500].hex};--svg-brand-3:${v[600].hex};--svg-brand-4:${v[700].hex}`;
  const dhcVars   = `--svg-bg:${n[700].hex};--svg-srf-1:${n[500].hex};--svg-srf-2:${n[600].hex};--svg-srf-3:${n[500].hex};--svg-srf-line:${n[400].hex};--svg-bristle:#fdfcfb;--svg-brand-1:${v[200].hex};--svg-brand-2:${v[300].hex};--svg-brand-3:${v[400].hex};--svg-brand-4:${v[500].hex}`;

  document.getElementById(containerId).innerHTML = `
    <div class="surface-panel" style="background:${s[100].hex};color:${textLight};${lightVars}">
      <div class="surface-panel-left">
        <div class="mode-tag">Light</div><h3>Surfaces (25&ndash;100)</h3>
        ${buildPanelSvg(0)}
      </div>
      <div class="surface-panel-right">
        <div class="surface-card" style="background:${s[25].hex}"><p><strong>Card (25)</strong> on BG (100)</p></div>
        <div class="surface-card" style="background:${s[50].hex}"><p><strong>Elevated (50)</strong> on BG (100)</p></div>
        <div class="surface-card" style="background:${s[75].hex}"><p><strong>Active (75)</strong> on BG (100)</p></div>
        ${buildMutedCard('light')}
        ${makeBtns('light')}
        ${buildErrorMiniCard('light')}
        ${buildAccentMiniCards(accentPalettes, 'light')}
      </div>
    </div>
    <div class="surface-panel" style="background:${s[875].hex};color:${textDark};${darkVars}">
      <div class="surface-panel-left">
        <div class="mode-tag">Dark</div><h3>Surfaces (800&ndash;875)</h3>
        ${buildPanelSvg(1)}
      </div>
      <div class="surface-panel-right">
        <div class="surface-card" style="background:${s[850].hex}"><p><strong>Card (850)</strong> on BG (875)</p></div>
        <div class="surface-card" style="background:${s[825].hex}"><p><strong>Elevated (825)</strong> on BG (875)</p></div>
        <div class="surface-card" style="background:${s[800].hex}"><p><strong>Active (800)</strong> on BG (875)</p></div>
        ${buildMutedCard('dark')}
        ${makeBtns('dark')}
        ${buildErrorMiniCard('dark')}
        ${buildAccentMiniCards(accentPalettes, 'dark')}
      </div>
    </div>
    <div class="surface-panel" style="background:${n[75].hex};color:#000000;${lhcVars}">
      <div class="surface-panel-left">
        <div class="mode-tag">Light &middot; High Contrast</div><h3>Neutral Surfaces</h3>
        ${buildPanelSvg(2)}
      </div>
      <div class="surface-panel-right">
        <div class="surface-card" style="background:#ffffff"><p><strong>Card (#fff)</strong> on BG (n75)</p></div>
        <div class="surface-card" style="background:${n[25].hex}"><p><strong>Elevated (n25)</strong> on BG (n75)</p></div>
        <div class="surface-card" style="background:${n[50].hex}"><p><strong>Active (n50)</strong> on BG (n75)</p></div>
        ${buildMutedCard('light-hc')}
        ${makeBtns('light-hc')}
        ${buildErrorMiniCard('light-hc')}
        ${buildAccentMiniCards(accentPalettes, 'light-hc')}
      </div>
    </div>
    <div class="surface-panel" style="background:${n[925].hex};color:#ffffff;${dhcVars}">
      <div class="surface-panel-left">
        <div class="mode-tag">Dark &middot; High Contrast</div><h3>Neutral Surfaces</h3>
        ${buildPanelSvg(3)}
      </div>
      <div class="surface-panel-right">
        <div class="surface-card" style="background:#000000"><p><strong>Card (#000)</strong> on BG (n925)</p></div>
        <div class="surface-card" style="background:${n[975].hex}"><p><strong>Elevated (n975)</strong> on BG (n925)</p></div>
        <div class="surface-card" style="background:${n[950].hex}"><p><strong>Active (n950)</strong> on BG (n925)</p></div>
        ${buildMutedCard('dark-hc')}
        ${makeBtns('dark-hc')}
        ${buildErrorMiniCard('dark-hc')}
        ${buildAccentMiniCards(accentPalettes, 'dark-hc')}
      </div>
    </div>`;
}
