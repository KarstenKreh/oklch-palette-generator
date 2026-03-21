// ================================================================
//  Accent color UI controls
// ================================================================

import { state, regenerate } from './state.js';
import { openColorPicker } from './color-picker.js';

export function toggleBgAutoMatch() {
  state.bgAutoMatch = !state.bgAutoMatch;
  document.getElementById('bgAutoBtn').classList.toggle('active', state.bgAutoMatch);
  if (state.bgAutoMatch) regenerate();
}

export function toggleErrorAutoMatch() {
  state.errorAutoMatch = !state.errorAutoMatch;
  document.getElementById('errorAutoBtn').classList.toggle('active', state.errorAutoMatch);
  if (state.errorAutoMatch) regenerate();
}

export function toggleBrandPin() {
  state.brandPin = !state.brandPin;
  document.getElementById('brandPinBtn').classList.toggle('active', state.brandPin);
  regenerate();
}

export function toggleErrorPin() {
  state.errorPin = !state.errorPin;
  document.getElementById('errorPinBtn').classList.toggle('active', state.errorPin);
  regenerate();
}

export function toggleAccentPin(i) {
  state.extraAccents[i].pin = !state.extraAccents[i].pin;
  const btn = document.getElementById('accentPin' + i);
  if (btn) btn.classList.toggle('active', state.extraAccents[i].pin);
  regenerate();
}

export function addAccent() {
  if (state.extraAccents.length >= 3) return;
  state.extraAccents.push({ name: 'Extra ' + (state.extraAccents.length + 1), hex: '#7C3AED', pin: false });
  renderAccentInputs();
  regenerate();
}

export function removeAccent(index) {
  state.extraAccents.splice(index, 1);
  renderAccentInputs();
  regenerate();
}

export function renderAccentInputs() {
  const container = document.getElementById('accentInputsContainer');
  const addBtn = document.getElementById('addAccentBtn');
  if (addBtn) addBtn.disabled = state.extraAccents.length >= 3;

  if (state.extraAccents.length === 0) {
    container.className = '';
    container.style.cssText = 'display:none';
    container.innerHTML = '';
    return;
  }

  container.className = 'color-pair-groups-row';
  container.style.cssText = '';

  container.innerHTML = state.extraAccents.map((a, i) => `
    <div class="color-pair-group">
      <div class="color-input-col">
        <div class="color-col-header">
          <input type="text" class="accent-name-input" id="accentName${i}" value="${a.name}" placeholder="Name" maxlength="20">
          <div style="display:flex;gap:0.25rem">
            <button class="auto-btn${a.pin ? ' active' : ''}" id="accentPin${i}" onclick="toggleAccentPin(${i})">Pin</button>
            <button class="accent-delete-btn" onclick="removeAccent(${i})">&#x2715;</button>
          </div>
        </div>
        <div class="color-input-wrapper">
          <div class="color-preview-swatch" id="accentSwatch${i}" style="background:${a.hex}"></div>
          <span style="color:var(--text-faint);font-size:1.1rem;font-family:monospace">#</span>
          <input type="text" class="accent-hex-input" id="accentHex${i}" value="${a.hex.replace('#','')}" maxlength="6" spellcheck="false">
        </div>
      </div>
      <div class="color-input-col">
        <div class="color-col-header">
          <span class="color-col-label">Surface</span>
          <span class="color-surface-auto">auto</span>
        </div>
        <div class="color-input-wrapper">
          <div class="color-preview-swatch" id="accentSurfaceSwatch${i}" style="background:var(--bg-surface)"></div>
          <span style="color:var(--text-faint);font-size:1.1rem;font-family:monospace">#</span>
          <span id="accentSurfaceHex${i}" style="font-size:1.1rem;font-family:'Cascadia Code','Fira Code',monospace;color:var(--text-dim)">—</span>
        </div>
      </div>
    </div>`).join('');

  state.extraAccents.forEach((a, i) => {
    const hexInp  = document.getElementById('accentHex' + i);
    const nameInp = document.getElementById('accentName' + i);
    const swatch  = document.getElementById('accentSwatch' + i);

    swatch.addEventListener('click', () => {
      openColorPicker(swatch, state.extraAccents[i].hex, newHex => {
        state.extraAccents[i].hex = newHex;
        hexInp.value = newHex.replace('#', '');
        swatch.style.background = newHex;
        regenerate();
      });
    });
    hexInp.addEventListener('paste', e => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/#/g, '').trim().slice(0, 6);
      e.target.value = text;
      e.target.dispatchEvent(new Event('input', { bubbles: true }));
    });
    hexInp.addEventListener('input', e => {
      const cleaned = e.target.value.replace(/#/g, '');
      if (cleaned !== e.target.value) e.target.value = cleaned;
      if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
        state.extraAccents[i].hex = '#' + cleaned.toUpperCase();
        swatch.style.background = state.extraAccents[i].hex;
        regenerate();
      }
    });
    hexInp.addEventListener('keydown', e => { if (e.key === 'Enter') regenerate(); });
    nameInp.addEventListener('input', e => {
      state.extraAccents[i].name = e.target.value || 'Extra ' + (i + 1);
      regenerate();
    });
  });
}
