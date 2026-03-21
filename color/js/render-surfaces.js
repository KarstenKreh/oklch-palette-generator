// ================================================================
//  Surface preview rendering
// ================================================================

import { contrastRatio } from './color-math.js';
import { generateShadowValues } from './shadows.js';

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
  const textLight = s[850].hex;
  const textDark  = s[75].hex;

  // Semantic button mappings: --primary, --secondary, --destructive
  const makeBtns = (panelType) => {
    const isDark = (panelType === 'dark' || panelType === 'dark-hc');
    // Primary → brand 600/400 (semantic --primary)
    const primBg = isDark ? v[400].hex : v[600].hex;
    const primFg = contrastRatio('#FFFFFF', primBg) >= 4.5 ? '#fff' : '#111';
    // Secondary → brand 200/800 (semantic --secondary)
    const secBg = isDark ? v[800].hex : v[200].hex;
    const secFg = contrastRatio('#FFFFFF', secBg) >= 4.5 ? '#fff' : '#111';
    // Destructive → error 600/400 (semantic --destructive)
    const destBg = isDark ? e[400].hex : e[600].hex;
    const destFg = contrastRatio('#FFFFFF', destBg) >= 4.5 ? '#fff' : '#111';
    return `<div class="surface-btns">
      <div class="surface-btn" style="background:${primBg};color:${primFg}">Primary</div>
      <div class="surface-btn" style="background:${secBg};color:${secFg}">Secondary</div>
      <div class="surface-btn" style="background:${destBg};color:${destFg}">Error</div>
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

  // Unified badge builder — maps to semantic tokens:
  //   bg → subtle (palette 100/800), border → border (surface 300/700),
  //   text → subtle-foreground (palette 950/50), dot → main (palette 600/400)
  const buildBadge = (palette, surfPalette, label, panelType) => {
    const p = {}; (palette || []).forEach(r => p[r.step] = r);
    const sp = {}; (surfPalette || []).forEach(r => sp[r.step] = r);
    let bgColor, borderColor, textColor, dotColor;
    if (panelType === 'light')         { bgColor = p[100]?.hex; borderColor = (sp[300] || p[300])?.hex; textColor = p[950]?.hex; dotColor = p[600]?.hex; }
    else if (panelType === 'dark')     { bgColor = p[800]?.hex; borderColor = (sp[700] || p[700])?.hex; textColor = p[50]?.hex;  dotColor = p[400]?.hex; }
    else if (panelType === 'light-hc') { bgColor = '#ffffff';   borderColor = (sp[200] || p[200])?.hex; textColor = p[950]?.hex; dotColor = p[700]?.hex; }
    else                               { bgColor = '#000000';   borderColor = (sp[800] || p[800])?.hex; textColor = p[50]?.hex;  dotColor = p[300]?.hex; }
    return `<div class="accent-mini-card" style="background:${bgColor || '#888'};border-color:${borderColor || '#666'};color:${textColor || '#333'}">
      <div class="accent-mini-card-dot" style="background:${dotColor || '#666'}"></div>${label}
    </div>`;
  };

  const buildShadowBoxes = (panelBgHex, cardHex, isDark, textHex, borderMutedHex) => {
    const shadows = generateShadowValues(panelBgHex, isDark);
    return `<div class="surface-shadow-card" style="background:${cardHex}">
      <div class="surface-shadow-row">${shadows.map(({ name, shadow }) =>
        `<div class="surface-shadow-circle" style="background:${panelBgHex};box-shadow:${shadow};color:${textHex};border:1px solid ${borderMutedHex}"><span>${name}</span></div>`
      ).join('')}</div>
    </div>`;
  };

  const buildDividers = (panelType) => {
    let borderColor, borderMutedColor;
    if (panelType === 'light')         { borderColor = s[300].hex; borderMutedColor = s[200].hex; }
    else if (panelType === 'dark')     { borderColor = s[600].hex; borderMutedColor = s[700].hex; }
    else if (panelType === 'light-hc') { borderColor = n[300].hex; borderMutedColor = n[200].hex; }
    else                               { borderColor = n[600].hex; borderMutedColor = n[700].hex; }
    return { borderColor, borderMutedColor };
  };

  const buildAllBadges = (accentPalettes, panelType) => {
    const errorBadge = buildBadge(errorPalette, errorSlatedPalette, 'Error', panelType);
    const accentBadges = accentPalettes.map(entry =>
      buildBadge(entry.palette, entry.surfacePalette, entry.name, panelType)
    ).join('');
    return `<div class="surface-accent-badges">${errorBadge}${accentBadges}</div>`;
  };

  const lightVars = `--svg-bg:${s[200].hex};--svg-srf-1:${s[75].hex};--svg-srf-2:${s[300].hex};--svg-srf-3:${s[200].hex};--svg-srf-line:${s[400].hex};--svg-bristle:#fdfcfb;--svg-brand-1:${v[300].hex};--svg-brand-2:${v[400].hex};--svg-brand-3:${v[500].hex};--svg-brand-4:${v[600].hex}`;
  const darkVars  = `--svg-bg:${s[700].hex};--svg-srf-1:${s[500].hex};--svg-srf-2:${s[600].hex};--svg-srf-3:${s[500].hex};--svg-srf-line:${s[400].hex};--svg-bristle:#fdfcfb;--svg-brand-1:${v[300].hex};--svg-brand-2:${v[400].hex};--svg-brand-3:${v[500].hex};--svg-brand-4:${v[600].hex}`;
  const lhcVars   = `--svg-bg:${n[200].hex};--svg-srf-1:#ffffff;--svg-srf-2:${n[400].hex};--svg-srf-3:${n[300].hex};--svg-srf-line:${n[500].hex};--svg-bristle:#fdfcfb;--svg-brand-1:${v[400].hex};--svg-brand-2:${v[500].hex};--svg-brand-3:${v[600].hex};--svg-brand-4:${v[700].hex}`;
  const dhcVars   = `--svg-bg:${n[700].hex};--svg-srf-1:${n[500].hex};--svg-srf-2:${n[600].hex};--svg-srf-3:${n[500].hex};--svg-srf-line:${n[400].hex};--svg-bristle:#fdfcfb;--svg-brand-1:${v[200].hex};--svg-brand-2:${v[300].hex};--svg-brand-3:${v[400].hex};--svg-brand-4:${v[500].hex}`;

  const buildPanel = (bgHex, textHex, cssVars, modeLabel, heading, svgIdx, cards, mutedType, panelType, isDark, shadowBgHex, shadowCardHex) => {
    const d = buildDividers(panelType);
    return `<div class="surface-panel" style="background:${bgHex};color:${textHex};${cssVars}">
      <div class="surface-panel-top">
        <div class="surface-panel-left">
          <div class="mode-tag">${modeLabel}</div><h3>${heading}</h3>
          ${buildPanelSvg(svgIdx)}
        </div>
        <div class="surface-panel-right">
          ${cards}
          ${buildMutedCard(mutedType)}
        </div>
      </div>
      <div class="surface-divider-row">
        <div class="surface-divider" style="border-color:${d.borderColor}"><span>Border</span></div>
        <div class="surface-divider" style="border-color:${d.borderMutedColor}"><span>Border Muted</span></div>
      </div>
      <div class="surface-panel-bottom">
        ${makeBtns(panelType)}
        ${buildAllBadges(accentPalettes, panelType)}
        ${buildShadowBoxes(shadowBgHex, shadowCardHex, isDark, textHex, d.borderMutedColor)}
      </div>
    </div>`;
  };

  document.getElementById(containerId).innerHTML =
    buildPanel(s[100].hex, textLight, lightVars, 'Light', 'Surfaces (25&ndash;100)', 0,
      `<div class="surface-card" style="background:${s[25].hex}"><p><strong>Card (25)</strong> on BG (100)</p></div>
       <div class="surface-card" style="background:${s[50].hex}"><p><strong>Elevated (50)</strong> on BG (100)</p></div>
       <div class="surface-card" style="background:${s[75].hex}"><p><strong>Active (75)</strong> on BG (100)</p></div>`,
      'light', 'light', false, s[100].hex, s[25].hex) +
    buildPanel(s[875].hex, textDark, darkVars, 'Dark', 'Surfaces (800&ndash;875)', 1,
      `<div class="surface-card" style="background:${s[850].hex}"><p><strong>Card (850)</strong> on BG (875)</p></div>
       <div class="surface-card" style="background:${s[825].hex}"><p><strong>Elevated (825)</strong> on BG (875)</p></div>
       <div class="surface-card" style="background:${s[800].hex}"><p><strong>Active (800)</strong> on BG (875)</p></div>`,
      'dark', 'dark', true, s[875].hex, s[850].hex) +
    buildPanel(n[75].hex, '#000000', lhcVars, 'Light &middot; High Contrast', 'Neutral Surfaces', 2,
      `<div class="surface-card" style="background:#ffffff"><p><strong>Card (#fff)</strong> on BG (n75)</p></div>
       <div class="surface-card" style="background:${n[25].hex}"><p><strong>Elevated (n25)</strong> on BG (n75)</p></div>
       <div class="surface-card" style="background:${n[50].hex}"><p><strong>Active (n50)</strong> on BG (n75)</p></div>`,
      'light-hc', 'light-hc', false, n[75].hex, '#ffffff') +
    buildPanel(n[925].hex, '#ffffff', dhcVars, 'Dark &middot; High Contrast', 'Neutral Surfaces', 3,
      `<div class="surface-card" style="background:#000000"><p><strong>Card (#000)</strong> on BG (n925)</p></div>
       <div class="surface-card" style="background:${n[975].hex}"><p><strong>Elevated (n975)</strong> on BG (n925)</p></div>
       <div class="surface-card" style="background:${n[950].hex}"><p><strong>Active (n950)</strong> on BG (n925)</p></div>`,
      'dark-hc', 'dark-hc', true, n[925].hex, '#000000');
}
