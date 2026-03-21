// ================================================================
//  Custom Color Picker (HSV square + Hue bar + Hex/HSL/RGB inputs)
// ================================================================

import { hexToRgb, rgbToHsv, hsvToRgb, rgbToHsl, hslToRgb } from './color-math.js';

let popup, svArea, svThumb, hueBar, hueThumb, fieldsContainer;
let currentH = 0, currentS = 0, currentV = 1;
let currentMode = 'hex';
let onChange = null;
let anchorEl = null;

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

function rgbToHex255(r, g, b) {
  return '#' + [r, g, b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function createPopup() {
  popup = document.createElement('div');
  popup.className = 'cp-popup';
  popup.innerHTML = `
    <div class="cp-main">
      <div class="cp-sv-area"><div class="cp-sv-thumb"></div></div>
      <div class="cp-hue-bar"><div class="cp-hue-thumb"></div></div>
    </div>
    <div class="cp-mode-tabs">
      <button class="cp-tab active" data-mode="hex">HEX</button>
      <button class="cp-tab" data-mode="hsl">HSL</button>
      <button class="cp-tab" data-mode="rgb">RGB</button>
    </div>
    <div class="cp-fields"></div>`;
  document.body.appendChild(popup);

  svArea = popup.querySelector('.cp-sv-area');
  svThumb = popup.querySelector('.cp-sv-thumb');
  hueBar = popup.querySelector('.cp-hue-bar');
  hueThumb = popup.querySelector('.cp-hue-thumb');
  fieldsContainer = popup.querySelector('.cp-fields');

  // SV area drag
  svArea.addEventListener('pointerdown', e => {
    e.preventDefault();
    svArea.setPointerCapture(e.pointerId);
    handleSv(e);
  });
  svArea.addEventListener('pointermove', e => {
    if (svArea.hasPointerCapture(e.pointerId)) handleSv(e);
  });

  // Hue bar drag
  hueBar.addEventListener('pointerdown', e => {
    e.preventDefault();
    hueBar.setPointerCapture(e.pointerId);
    handleHue(e);
  });
  hueBar.addEventListener('pointermove', e => {
    if (hueBar.hasPointerCapture(e.pointerId)) handleHue(e);
  });

  // Mode tabs
  popup.querySelector('.cp-mode-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.cp-tab');
    if (!tab) return;
    popup.querySelectorAll('.cp-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentMode = tab.dataset.mode;
    renderFields();
    syncFields();
  });
}

function handleSv(e) {
  const rect = svArea.getBoundingClientRect();
  currentS = clamp((e.clientX - rect.left) / rect.width, 0, 1);
  currentV = 1 - clamp((e.clientY - rect.top) / rect.height, 0, 1);
  update();
}

function handleHue(e) {
  const rect = hueBar.getBoundingClientRect();
  currentH = clamp((e.clientY - rect.top) / rect.height, 0, 1) * 360;
  update();
}

function update() {
  // Update visuals
  svThumb.style.left = (currentS * 100) + '%';
  svThumb.style.top = ((1 - currentV) * 100) + '%';
  hueThumb.style.top = ((currentH / 360) * 100) + '%';
  svArea.style.setProperty('--cp-hue-color', `hsl(${currentH}, 100%, 50%)`);

  // Thumb border color: dark on bright backgrounds, light on dark
  const thumbBorder = currentV > 0.6 && currentS < 0.4 ? '#333' : '#fff';
  svThumb.style.borderColor = thumbBorder;

  syncFields();

  // Fire callback
  if (onChange) {
    const [r, g, b] = hsvToRgb(currentH, currentS, currentV);
    onChange(rgbToHex255(r, g, b));
  }
}

function syncFields() {
  const [r, g, b] = hsvToRgb(currentH, currentS, currentV);
  if (currentMode === 'hex') {
    const inp = fieldsContainer.querySelector('.cp-hex-input');
    if (inp && inp !== document.activeElement) inp.value = rgbToHex255(r, g, b);
  } else if (currentMode === 'hsl') {
    const [h, s, l] = rgbToHsl(r, g, b);
    const inputs = fieldsContainer.querySelectorAll('.cp-num-input');
    if (inputs[0] && inputs[0] !== document.activeElement) inputs[0].value = Math.round(h);
    if (inputs[1] && inputs[1] !== document.activeElement) inputs[1].value = Math.round(s * 100);
    if (inputs[2] && inputs[2] !== document.activeElement) inputs[2].value = Math.round(l * 100);
  } else if (currentMode === 'rgb') {
    const inputs = fieldsContainer.querySelectorAll('.cp-num-input');
    if (inputs[0] && inputs[0] !== document.activeElement) inputs[0].value = r;
    if (inputs[1] && inputs[1] !== document.activeElement) inputs[1].value = g;
    if (inputs[2] && inputs[2] !== document.activeElement) inputs[2].value = b;
  }
}

function renderFields() {
  if (currentMode === 'hex') {
    fieldsContainer.innerHTML = `<div class="cp-field-row">
      <label class="cp-label">Hex</label>
      <input type="text" class="cp-hex-input" maxlength="7" spellcheck="false">
    </div>`;
    const inp = fieldsContainer.querySelector('.cp-hex-input');
    inp.addEventListener('input', () => {
      const v = inp.value.replace(/#/g, '');
      if (/^[0-9a-fA-F]{6}$/.test(v)) {
        const [r, g, b] = hexToRgb('#' + v);
        [currentH, currentS, currentV] = rgbToHsv(r, g, b);
        update();
      }
    });
  } else if (currentMode === 'hsl') {
    fieldsContainer.innerHTML = `<div class="cp-field-row">
      <div class="cp-field"><label class="cp-label">H</label><input type="number" class="cp-num-input" min="0" max="360"></div>
      <div class="cp-field"><label class="cp-label">S</label><input type="number" class="cp-num-input" min="0" max="100"></div>
      <div class="cp-field"><label class="cp-label">L</label><input type="number" class="cp-num-input" min="0" max="100"></div>
    </div>`;
    fieldsContainer.querySelectorAll('.cp-num-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const inputs = fieldsContainer.querySelectorAll('.cp-num-input');
        const h = clamp(parseInt(inputs[0].value) || 0, 0, 360);
        const s = clamp(parseInt(inputs[1].value) || 0, 0, 100) / 100;
        const l = clamp(parseInt(inputs[2].value) || 0, 0, 100) / 100;
        const [r, g, b] = hslToRgb(h, s, l);
        [currentH, currentS, currentV] = rgbToHsv(r, g, b);
        update();
      });
    });
  } else {
    fieldsContainer.innerHTML = `<div class="cp-field-row">
      <div class="cp-field"><label class="cp-label">R</label><input type="number" class="cp-num-input" min="0" max="255"></div>
      <div class="cp-field"><label class="cp-label">G</label><input type="number" class="cp-num-input" min="0" max="255"></div>
      <div class="cp-field"><label class="cp-label">B</label><input type="number" class="cp-num-input" min="0" max="255"></div>
    </div>`;
    fieldsContainer.querySelectorAll('.cp-num-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const inputs = fieldsContainer.querySelectorAll('.cp-num-input');
        const r = clamp(parseInt(inputs[0].value) || 0, 0, 255);
        const g = clamp(parseInt(inputs[1].value) || 0, 0, 255);
        const b = clamp(parseInt(inputs[2].value) || 0, 0, 255);
        [currentH, currentS, currentV] = rgbToHsv(r, g, b);
        update();
      });
    });
  }
}

function position() {
  if (!anchorEl) return;
  const rect = anchorEl.getBoundingClientRect();
  const popW = 260, popH = 320;
  let top = rect.bottom + window.scrollY + 8;
  let left = rect.left + window.scrollX;

  // Flip up if no space below
  if (top + popH > window.scrollY + window.innerHeight) {
    top = rect.top + window.scrollY - popH - 8;
  }
  // Keep in viewport horizontally
  if (left + popW > window.scrollX + window.innerWidth) {
    left = window.scrollX + window.innerWidth - popW - 8;
  }

  popup.style.top = top + 'px';
  popup.style.left = left + 'px';
}

function closeListener(e) {
  if (!popup.contains(e.target) && e.target !== anchorEl && !anchorEl?.contains(e.target)) {
    close();
  }
}

function escListener(e) {
  if (e.key === 'Escape') close();
}

function close() {
  popup.classList.remove('open');
  document.removeEventListener('pointerdown', closeListener, true);
  document.removeEventListener('keydown', escListener);
  anchorEl = null;
  onChange = null;
}

export function openColorPicker(swatchEl, currentHex, cb) {
  if (!popup) createPopup();

  // If clicking the same swatch that's already open, close it
  if (anchorEl === swatchEl && popup.classList.contains('open')) {
    close();
    return;
  }

  anchorEl = swatchEl;
  onChange = cb;

  // Set state from hex
  const [r, g, b] = hexToRgb(currentHex);
  [currentH, currentS, currentV] = rgbToHsv(r, g, b);

  // Render and sync
  renderFields();
  svArea.style.setProperty('--cp-hue-color', `hsl(${currentH}, 100%, 50%)`);
  svThumb.style.left = (currentS * 100) + '%';
  svThumb.style.top = ((1 - currentV) * 100) + '%';
  hueThumb.style.top = ((currentH / 360) * 100) + '%';
  syncFields();

  popup.classList.add('open');
  position();

  // Defer listeners to avoid immediate close from the click that opened us
  setTimeout(() => {
    document.addEventListener('pointerdown', closeListener, true);
    document.addEventListener('keydown', escListener);
  }, 0);
}
