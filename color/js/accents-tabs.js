// ================================================================
//  Accent tabs & helpers
// ================================================================

import { contrastRatio } from './color-math.js';
import { state } from './state.js';
import { renderTable } from './render-table.js';

export function accentCssName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'accent';
}

export function renderAccentTabs(accentPalettes) {
  const group  = document.getElementById('primitiveTabGroup');
  const tabBar = document.getElementById('primitiveTabBar');
  if (!group || !tabBar) return;
  // Remove existing dynamic accent tabs
  group.querySelectorAll('[data-tab^="accent-"]').forEach(el => el.remove());
  // Insert before Neutral (always last)
  const neutralBtn     = tabBar.querySelector('[data-tab="neutral"]');
  const neutralContent = group.querySelector('.tab-content[data-tab="neutral"]');
  const pct  = Math.round(state.chromaScale * 100);
  const thead = `<thead><tr><th>Step</th><th>Color</th><th>Hex</th><th>OKLCH</th><th>L</th><th>C</th><th>Zone</th></tr></thead>`;

  accentPalettes.forEach((entry, i) => {
    const tabId = 'accent-' + i;

    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.dataset.tab = tabId;
    btn.textContent = entry.name;
    tabBar.insertBefore(btn, neutralBtn);

    const content = document.createElement('div');
    content.className = 'tab-content';
    content.dataset.tab = tabId;
    content.innerHTML = `
      <div class="sub-tab-bar">
        <button class="sub-tab-btn active" data-subtab="${tabId}-color">Action</button>
        <button class="sub-tab-btn" data-subtab="${tabId}-surface">Surface</button>
      </div>
      <div class="sub-tab-content active" data-subtab="${tabId}-color">
        <p class="section-desc">Full chroma &mdash; ${entry.name} accent scale</p>
        <table>${thead}<tbody id="table-accent-${i}"></tbody></table>
      </div>
      <div class="sub-tab-content" data-subtab="${tabId}-surface">
        <p class="section-desc">${entry.name} surface palette &mdash; ${pct}% chroma</p>
        <table>${thead}<tbody id="table-accent-surface-${i}"></tbody></table>
      </div>`;
    group.insertBefore(content, neutralContent);
    renderTable('table-accent-' + i, entry.palette);
    renderTable('table-accent-surface-' + i, entry.slatedPalette || entry.palette);
  });
}

export function buildAccentBtns(accentPalettes, panelType) {
  if (!accentPalettes || accentPalettes.length === 0) return '';
  return accentPalettes.map(entry => {
    const a = {}; entry.palette.forEach(r => a[r.step] = r);
    const btnSwatch = (panelType === 'light' || panelType === 'light-hc') ? a[600] : a[400];
    const fg = contrastRatio('#FFFFFF', btnSwatch.hex) >= 4.5 ? '#fff' : '#111';
    return `<div class="surface-btn" style="background:${btnSwatch.hex};color:${fg}">${entry.name}</div>`;
  }).join('');
}

export function buildAccentMiniCards(accentPalettes, panelType) {
  if (!accentPalettes || accentPalettes.length === 0) return '';
  return accentPalettes.map(entry => {
    const a = {}; entry.palette.forEach(r => a[r.step] = r);
    const as = {}; (entry.slatedPalette || entry.palette).forEach(r => as[r.step] = r);
    let bgColor, borderColor, textColor, dotColor;
    if (panelType === 'light')         { bgColor = as[100].hex; borderColor = as[300].hex; textColor = as[800].hex; dotColor = entry.pin ? entry.hex : a[600].hex; }
    else if (panelType === 'dark')     { bgColor = as[850].hex; borderColor = as[700].hex; textColor = as[100].hex; dotColor = entry.pin ? entry.hex : a[400].hex; }
    else if (panelType === 'light-hc') { bgColor = '#ffffff';   borderColor = as[200].hex; textColor = as[900].hex; dotColor = entry.pin ? entry.hex : a[700].hex; }
    else                               { bgColor = '#000000';   borderColor = as[800].hex; textColor = as[75].hex;  dotColor = entry.pin ? entry.hex : a[300].hex; }
    return `<div class="accent-mini-card" style="background:${bgColor};border-color:${borderColor};color:${textColor}">
      <div class="accent-mini-card-dot" style="background:${dotColor}"></div>
      ${entry.name}
    </div>`;
  }).join('');
}
