// ================================================================
//  Event listeners
// ================================================================

import { state, regenerate } from './state.js';
import { openColorPicker } from './color-picker.js';

function debounce(fn, ms) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export function initEvents() {
  // ── Primary color inputs ──
  document.getElementById('swatchPreview').addEventListener('click', () => {
    const hex = '#' + document.getElementById('hexInput').value;
    openColorPicker(document.getElementById('swatchPreview'), hex, newHex => {
      document.getElementById('hexInput').value = newHex.replace('#', '');
      document.getElementById('swatchPreview').style.background = newHex;
      regenerate();
    });
  });
  document.getElementById('hexInput').addEventListener('keydown', e => { if (e.key === 'Enter') regenerate(); });
  document.getElementById('hexInput').addEventListener('paste', e => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text').replace(/#/g, '').trim().slice(0, 6);
    e.target.value = text;
    e.target.dispatchEvent(new Event('input', { bubbles: true }));
  });
  document.getElementById('hexInput').addEventListener('input', e => {
    const cleaned = e.target.value.replace(/#/g, '');
    if (cleaned !== e.target.value) e.target.value = cleaned;
    if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
      document.getElementById('swatchPreview').style.background = '#' + cleaned;
      regenerate();
    }
  });

  // ── Surface color inputs ──
  document.getElementById('bgSwatchPreview').addEventListener('click', () => {
    openColorPicker(document.getElementById('bgSwatchPreview'), state.bgColorHex, newHex => {
      state.bgAutoMatch = false;
      document.getElementById('bgAutoBtn').classList.remove('active');
      state.bgColorHex = newHex;
      document.getElementById('bgHexInput').value = newHex.replace('#', '');
      document.getElementById('bgSwatchPreview').style.background = newHex;
      regenerate();
    });
  });
  document.getElementById('bgHexInput').addEventListener('keydown', e => { if (e.key === 'Enter') regenerate(); });
  document.getElementById('bgHexInput').addEventListener('paste', e => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text').replace(/#/g, '').trim().slice(0, 6);
    e.target.value = text;
    e.target.dispatchEvent(new Event('input', { bubbles: true }));
  });
  document.getElementById('bgHexInput').addEventListener('input', e => {
    const cleaned = e.target.value.replace(/#/g, '');
    if (cleaned !== e.target.value) e.target.value = cleaned;
    if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
      state.bgAutoMatch = false;
      document.getElementById('bgAutoBtn').classList.remove('active');
      state.bgColorHex = '#' + cleaned.toUpperCase();
      document.getElementById('bgSwatchPreview').style.background = state.bgColorHex;
      regenerate();
    }
  });

  // ── Error color inputs ──
  document.getElementById('errorSwatchPreview').addEventListener('click', () => {
    openColorPicker(document.getElementById('errorSwatchPreview'), state.errorColorHex, newHex => {
      state.errorAutoMatch = false;
      document.getElementById('errorAutoBtn').classList.remove('active');
      state.errorColorHex = newHex;
      document.getElementById('errorHexInput').value = newHex.replace('#', '');
      document.getElementById('errorSwatchPreview').style.background = newHex;
      regenerate();
    });
  });
  document.getElementById('errorHexInput').addEventListener('keydown', e => { if (e.key === 'Enter') regenerate(); });
  document.getElementById('errorHexInput').addEventListener('paste', e => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text').replace(/#/g, '').trim().slice(0, 6);
    e.target.value = text;
    e.target.dispatchEvent(new Event('input', { bubbles: true }));
  });
  document.getElementById('errorHexInput').addEventListener('input', e => {
    const cleaned = e.target.value.replace(/#/g, '');
    if (cleaned !== e.target.value) e.target.value = cleaned;
    if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
      state.errorAutoMatch = false;
      document.getElementById('errorAutoBtn').classList.remove('active');
      state.errorColorHex = '#' + cleaned.toUpperCase();
      document.getElementById('errorSwatchPreview').style.background = state.errorColorHex;
      regenerate();
    }
  });

  // ── Chroma slider ──
  const debouncedGenerate = debounce(regenerate, 80);
  document.getElementById('chromaSlider').addEventListener('input', e => {
    state.chromaScale = e.target.value / 100;
    document.getElementById('chromaInput').value = e.target.value + '%';
    document.getElementById('chromaDescValue').textContent = e.target.value + '%';
    document.getElementById('errorSurfaceChromaVal').textContent = e.target.value + '%';
    debouncedGenerate();
  });
  document.getElementById('chromaInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') e.target.blur();
  });
  document.getElementById('chromaInput').addEventListener('change', e => {
    const val = Math.round(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)));
    state.chromaScale = val / 100;
    document.getElementById('chromaSlider').value = val;
    e.target.value = val + '%';
    document.getElementById('chromaDescValue').textContent = val + '%';
    document.getElementById('errorSurfaceChromaVal').textContent = val + '%';
    regenerate();
  });

  // ── Tabs — delegated ──
  document.addEventListener('click', e => {
    // Sub-tabs (checked first — more specific selector)
    const subBtn = e.target.closest('.sub-tab-btn');
    if (subBtn) {
      const panel = subBtn.closest('.tab-content');
      if (!panel) return;
      panel.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
      subBtn.classList.add('active');
      const subtab = subBtn.dataset.subtab;
      panel.querySelectorAll('.sub-tab-content').forEach(c =>
        c.classList.toggle('active', c.dataset.subtab === subtab));
      return;
    }
    // Top-level tabs
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    const group = btn.closest('.tab-group');
    if (!group) return;
    group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    group.querySelectorAll(':scope > .tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const target = group.querySelector(`:scope > .tab-content[data-tab="${btn.dataset.tab}"]`);
    if (target) target.classList.add('active');
  });
}
