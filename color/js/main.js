// ================================================================
//  Entry point — orchestrates all modules
// ================================================================

import { hexToOklch } from './color-math.js';
import { state, setRegenerateCallback } from './state.js';
import { generatePalette, computeAutoErrorHex } from './palette.js';
import { showToast, copyShareLink, copyValue, copyBlock } from './clipboard.js';
import { renderTable } from './render-table.js';
import { updateTheme } from './theme.js';
import { accentCssName, renderAccentTabs } from './accents-tabs.js';
import { renderSurfaces } from './render-surfaces.js';
import { renderCodeBlocks } from './render-code.js';
import { renderAccentInputs, addAccent, removeAccent, toggleAccentPin, toggleBrandPin, toggleErrorPin, toggleBgAutoMatch, toggleErrorAutoMatch } from './accents-ui.js';
import { encodeState, applyStateFromHash } from './url-state.js';
import { initEvents } from './events.js';

// ── Mode switch ──
function setMode(mode) {
  state.currentMode = mode;
  document.querySelectorAll('.mode-option').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  document.getElementById('modeHint').innerHTML = mode === 'balanced'
    ? '500 = perceptual midpoint (L=0.50) &mdash; palette is symmetric around the brightest point of the hue'
    : '500 = exactly your input color &mdash; lightness + chroma are scaled evenly around it';
  generate();
}

// ── Main generation ──
function generate() {
  const raw = document.getElementById('hexInput').value.replace(/#/g,'').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) {
    showToast('Please enter a valid 6-digit hex code');
    return;
  }
  const hex = '#' + raw.toUpperCase();
  const [bL, bC, bH] = hexToOklch(hex);

  document.getElementById('swatchPreview').style.background = hex;

  // Surface auto-match: mirror primary
  if (state.bgAutoMatch) {
    state.bgColorHex = hex;
    document.getElementById('bgHexInput').value = raw.toUpperCase();
    document.getElementById('bgSwatchPreview').style.background = hex;
  }

  document.getElementById('bgColorNote').textContent =
    state.bgColorHex.toLowerCase() !== hex.toLowerCase() ? ` · ${state.bgColorHex}` : '';

  // Error color (auto-match if enabled)
  if (state.errorAutoMatch) {
    state.errorColorHex = computeAutoErrorHex(hex);
    document.getElementById('errorHexInput').value = state.errorColorHex.replace('#', '');
    document.getElementById('errorSwatchPreview').style.background = state.errorColorHex;
  }

  const brand        = generatePalette(hex, 1.0);
  const bg           = generatePalette(state.bgColorHex, state.chromaScale);
  const error        = generatePalette(state.errorColorHex, 1.0);
  const errorSlated  = generatePalette(state.errorColorHex, state.chromaScale);
  const neutral      = generatePalette(state.bgColorHex, 0.0);
  const slated       = generatePalette(state.bgColorHex, state.chromaScale);

  const accentPalettes = state.extraAccents
    .map(a => /^#[0-9a-fA-F]{6}$/.test(a.hex)
      ? { name: a.name, hex: a.hex, cssName: accentCssName(a.name),
          palette: generatePalette(a.hex, 1.0),
          slatedPalette: generatePalette(a.hex, state.chromaScale),
          pin: !!a.pin }
      : null)
    .filter(Boolean);

  const c500brand   = brand.find(r => r.step === 500);
  const c500neutral = neutral.find(r => r.step === 500);

  // Update surface swatches to show the actual surface-50 (= --background) color
  const bg50 = bg.find(r => r.step === 50);
  if (bg50) document.getElementById('bgSwatchPreview').style.background = bg50.hex;

  // Pin overrides: use exact input hex when "Pin" is active
  const brandSwatch = state.brandPin
    ? { hex, L: hexToOklch(hex)[0] }
    : c500brand;
  const errorSwatchOverride = state.errorPin
    ? { hex: state.errorColorHex, L: hexToOklch(state.errorColorHex)[0] }
    : null;
  document.getElementById('chromaSlider').style.background =
    `linear-gradient(to right, ${c500neutral.hex}, ${c500brand.hex})`;
  const neutralExtended = [
    { step: 0,    L: 1, C: 0, H: 0, hex: '#FFFFFF', css: 'oklch(1 0 0)' },
    ...neutral,
    { step: 1000, L: 0, C: 0, H: 0, hex: '#000000', css: 'oklch(0 0 0)' }
  ];

  // Update surface preview swatches (auto-derived, read-only)
  const esSwatch = errorSlated.find(r => r.step === 50);
  if (esSwatch) {
    const el = document.getElementById('errorSurfacePreview');
    if (el) el.style.background = esSwatch.hex;
    const hx = document.getElementById('errorSurfaceHex');
    if (hx) hx.textContent = esSwatch.hex.replace('#', '');
  }

  updateTheme(brand, slated, neutral);
  renderTable('table-brand', brand);
  renderTable('table-bg', bg);
  renderTable('table-error', error);
  renderTable('table-error-surface', errorSlated);
  renderTable('table-neutral', neutralExtended, true);
  renderAccentTabs(accentPalettes);
  // Update accent surface preview swatches
  accentPalettes.forEach((entry, i) => {
    const s = entry.slatedPalette.find(r => r.step === 50);
    if (s) {
      const sw = document.getElementById('accentSurfaceSwatch' + i);
      if (sw) sw.style.background = s.hex;
      const hx = document.getElementById('accentSurfaceHex' + i);
      if (hx) hx.textContent = s.hex.replace('#', '');
    }
  });
  renderSurfaces('surfaces-demo', bg, slated, neutral, brandSwatch, brand, accentPalettes, error, errorSlated, errorSwatchOverride);
  renderCodeBlocks(brand, bg, error, errorSlated, neutral, state.bgColorHex.toLowerCase() !== hex.toLowerCase() ? state.bgColorHex : null, accentPalettes, state.brandPin, hex, state.errorPin, state.errorColorHex);
  document.getElementById('output').classList.add('visible');
  document.getElementById('previewCol').classList.add('visible');
  history.replaceState(null, '', '#' + encodeState());
  document.getElementById('favicon').href =
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${hex}"/></svg>`)}`;
}

// ── Wire up the regenerate callback ──
setRegenerateCallback(generate);

// ── Expose functions for inline onclick handlers ──
window.copyShareLink = copyShareLink;
window.copyBlock = copyBlock;
window.copyValue = copyValue;
window.toggleBrandPin = toggleBrandPin;
window.toggleBgAutoMatch = toggleBgAutoMatch;
window.toggleErrorAutoMatch = toggleErrorAutoMatch;
window.toggleErrorPin = toggleErrorPin;
window.addAccent = addAccent;
window.removeAccent = removeAccent;
window.toggleAccentPin = toggleAccentPin;
window.setMode = setMode;

// ── Initialize ──
initEvents();
applyStateFromHash();
generate();
