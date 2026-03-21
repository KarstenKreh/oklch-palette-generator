// ================================================================
//  Palette table rendering
// ================================================================

export function getZone(step, showHC = false) {
  if (step === 0)    return showHC ? { label: 'HC White', cls: 'hc' } : null;
  if (step === 1000) return showHC ? { label: 'HC Black', cls: 'hc' } : null;
  if (step <= 100)   return { label: 'Light Surfaces', cls: 'light' };
  if (step >= 825 && step <= 875) return { label: 'Dark Surfaces', cls: 'dark' };
  if (step >= 900 && showHC) return { label: 'High Contrast', cls: 'hc' };
  return null;
}

export function renderTable(tbodyId, palette, showHC = false) {
  document.getElementById(tbodyId).innerHTML = palette.map(r => {
    const is500 = r.step === 500;
    const bg = is500 ? ' style="background:rgba(255,255,255,0.04)"' : '';
    const b = is500 ? s => `<strong>${s}</strong>` : s => s;
    const zone = getZone(r.step, showHC);
    const zt = zone ? `<span class="zone-tag ${zone.cls}">${zone.label}</span>` : '';
    const dotOutline = is500 ? ';outline:2px solid rgba(255,255,255,0.5)' : '';
    return `<tr${bg}>
      <td>${b(r.step)}</td>
      <td><div class="color-dot" style="background:${r.hex}${dotOutline}"></div></td>
      <td><span class="copyable" onclick="copyValue(this)" data-value="${r.hex}">${b(r.hex)}</span></td>
      <td><span class="copyable" onclick="copyValue(this)" data-value="${r.css}">${b(r.css)}</span></td>
      <td>${b(r.L.toFixed(3))}</td>
      <td>${b(r.C.toFixed(3))}</td>
      <td>${zt}</td>
    </tr>`;
  }).join('');
}
