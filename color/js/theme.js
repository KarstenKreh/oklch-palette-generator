// ================================================================
//  Theme update — Dark HC palette drives page chrome
// ================================================================

export function updateTheme(vibrant, slated, neutral) {
  const v  = {}; vibrant.forEach(r => v[r.step]  = r);
  const sl = {}; slated.forEach(r  => sl[r.step] = r);
  const n  = {}; neutral.forEach(r => n[r.step]  = r);
  const root = document.documentElement;

  root.style.setProperty('--bg-page',     n[975].hex);
  root.style.setProperty('--bg-surface',  n[950].hex);
  root.style.setProperty('--bg-code',     n[975].hex);
  root.style.setProperty('--border',      n[900].hex);
  root.style.setProperty('--border-sub',  n[925].hex);
  root.style.setProperty('--border-hi',   n[800].hex);
  root.style.setProperty('--toast-bg',    n[900].hex);

  root.style.setProperty('--text-hi',     sl[75].hex);
  root.style.setProperty('--text-mid',    sl[200].hex);
  root.style.setProperty('--text-low',    sl[300].hex);
  root.style.setProperty('--text-dim',    sl[400].hex);
  root.style.setProperty('--text-faint',  sl[500].hex);
  root.style.setProperty('--text-info',   sl[200].hex);

  root.style.setProperty('--accent',      v[500].hex);
  root.style.setProperty('--accent-bg',   v[800].hex);
  root.style.setProperty('--accent-text', v[300].hex);

  const h = v[500].hex.replace('#', '');
  const r = parseInt(h.slice(0,2), 16);
  const g = parseInt(h.slice(2,4), 16);
  const b = parseInt(h.slice(4,6), 16);
  root.style.setProperty('--focus-ring', `rgba(${r},${g},${b},0.2)`);
}
