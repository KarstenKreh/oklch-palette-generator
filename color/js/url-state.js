// ================================================================
//  URL state serialization (share links)
// ================================================================

import { state } from './state.js';
import { renderAccentInputs } from './accents-ui.js';

export function encodeState() {
  const brand = document.getElementById('hexInput').value.replace(/#/g,'').trim();
  const bg    = state.bgColorHex.replace('#','');
  const err   = state.errorColorHex.replace('#','');
  const chroma = Math.round(state.chromaScale * 100);
  let hash = `${brand},${bg},${state.bgAutoMatch?1:0},${err},${state.errorAutoMatch?1:0},${chroma},${state.currentMode},${state.brandPin?1:0},${state.errorPin?1:0}`;
  state.extraAccents.forEach(a => {
    hash += `!${encodeURIComponent(a.name)}:${a.hex.replace('#','')}:${a.pin?1:0}`;
  });
  return hash;
}

export function applyStateFromHash() {
  const hash = window.location.hash.slice(1);
  if (!hash) return;
  const segments = hash.split('!');
  const p = segments[0].split(',');
  if (p.length < 7) return;
  const [brand, bg, bgAuto, err, errAuto, chroma, mode] = p;
  if (/^[0-9a-fA-F]{6}$/.test(brand)) {
    document.getElementById('hexInput').value = brand.toUpperCase();
    document.getElementById('swatchPreview').style.background = '#' + brand;
  }
  state.bgAutoMatch = bgAuto === '1';
  document.getElementById('bgAutoBtn').classList.toggle('active', state.bgAutoMatch);
  if (/^[0-9a-fA-F]{6}$/.test(bg)) {
    state.bgColorHex = '#' + bg.toUpperCase();
    document.getElementById('bgHexInput').value = bg.toUpperCase();
    document.getElementById('bgSwatchPreview').style.background = '#' + bg;
  }
  state.errorAutoMatch = errAuto === '1';
  document.getElementById('errorAutoBtn').classList.toggle('active', state.errorAutoMatch);
  if (/^[0-9a-fA-F]{6}$/.test(err)) {
    state.errorColorHex = '#' + err.toUpperCase();
    document.getElementById('errorHexInput').value = err.toUpperCase();
    document.getElementById('errorSwatchPreview').style.background = '#' + err;
  }
  const chromaVal = parseInt(chroma);
  if (!isNaN(chromaVal) && chromaVal >= 0 && chromaVal <= 100) {
    state.chromaScale = chromaVal / 100;
    document.getElementById('chromaSlider').value = chromaVal;
    document.getElementById('chromaInput').value = chromaVal + '%';
  }
  if (mode === 'balanced' || mode === 'exact') {
    state.currentMode = mode;
    document.querySelectorAll('.mode-option').forEach(btn =>
      btn.classList.toggle('active', btn.dataset.mode === mode));
  }
  // Restore brandPin / errorPin (parts 8 & 9, default false for old URLs)
  state.brandPin = p[7] === '1';
  state.errorPin = p[8] === '1';
  document.getElementById('brandPinBtn')?.classList.toggle('active', state.brandPin);
  document.getElementById('errorPinBtn')?.classList.toggle('active', state.errorPin);

  // Restore extra accents from !name:hex[:pin] segments
  state.extraAccents = [];
  for (let i = 1; i < segments.length; i++) {
    const firstColon = segments[i].indexOf(':');
    if (firstColon === -1) continue;
    const rawName = segments[i].substring(0, firstColon);
    const rest    = segments[i].substring(firstColon + 1);
    const restParts = rest.split(':');
    const rawHex  = restParts[0];
    const pin     = restParts[1] === '1';
    const name = decodeURIComponent(rawName) || ('Extra ' + i);
    if (/^[0-9a-fA-F]{6}$/.test(rawHex)) {
      state.extraAccents.push({ name, hex: '#' + rawHex.toUpperCase(), pin });
    }
  }
  renderAccentInputs();
}
