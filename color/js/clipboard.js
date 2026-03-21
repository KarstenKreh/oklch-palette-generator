// ================================================================
//  Clipboard & toast
// ================================================================

import { state } from './state.js';

export function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

export function copyToClipboard(text, onSuccess) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(onSuccess);
  } else {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    onSuccess();
  }
}

export function copyShareLink() {
  const url = window.location.href;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(() => showToast('Share link copied!'));
  } else {
    const el = document.createElement('textarea');
    el.value = url;
    el.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast('Share link copied!');
  }
}

export function copyValue(el) {
  copyToClipboard(el.dataset.value, () => {
    showToast('Copied: ' + el.dataset.value);
    el.classList.add('copied');
    setTimeout(() => el.classList.remove('copied'), 1200);
  });
}

export function copyBlock(id) {
  const block = document.getElementById(id);
  const text = block.innerText.replace(/^Copy\n?/, '').trim();
  const btn = block.querySelector('.copy-block-btn');
  copyToClipboard(text, () => {
    showToast('Block copied!');
    btn.textContent = 'Copied!'; btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  });
}
