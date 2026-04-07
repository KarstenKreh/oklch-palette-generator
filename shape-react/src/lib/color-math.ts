// OKLCH Color Math — pure functions, no side effects

export function srgbToLinear(c: number): number {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(c: number): number {
  c = Math.max(0, Math.min(1, c));
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

export function linearSrgbToOklab(r: number, g: number, b: number): [number, number, number] {
  let l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  let m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  let s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  l_ = Math.cbrt(l_); m_ = Math.cbrt(m_); s_ = Math.cbrt(s_);
  return [
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  ];
}

export function oklabToLinearSrgb(L: number, a: number, b: number): [number, number, number] {
  let l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  let m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  let s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  l_ = l_ * l_ * l_; m_ = m_ * m_ * m_; s_ = s_ * s_ * s_;
  return [
    +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_,
  ];
}

export function oklabToOklch(L: number, a: number, b: number): [number, number, number] {
  return [L, Math.sqrt(a * a + b * b), ((Math.atan2(b, a) * 180 / Math.PI) % 360 + 360) % 360];
}

export function oklchToOklab(L: number, C: number, H: number): [number, number, number] {
  const rad = H * Math.PI / 180;
  return [L, C * Math.cos(rad), C * Math.sin(rad)];
}

export function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace('#', '');
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v * 255)));
  return '#' + [r, g, b].map(c => clamp(c).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function hexToOklch(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  const [lr, lg, lb] = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
  const [L, a, ob] = linearSrgbToOklab(lr, lg, lb);
  return oklabToOklch(L, a, ob);
}

export function oklchToHex(L: number, C: number, H: number): string {
  const [oL, oa, ob] = oklchToOklab(L, C, H);
  const [r, g, b] = oklabToLinearSrgb(oL, oa, ob);
  return rgbToHex(linearToSrgb(r), linearToSrgb(g), linearToSrgb(b));
}

export function isInGamut(L: number, C: number, H: number): boolean {
  const [oL, oa, ob] = oklchToOklab(L, C, H);
  const [r, g, b] = oklabToLinearSrgb(oL, oa, ob);
  return r >= -0.001 && r <= 1.001 && g >= -0.001 && g <= 1.001 && b >= -0.001 && b <= 1.001;
}

export function maxChromaInGamut(L: number, H: number): number {
  let lo = 0, hi = 0.4;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (isInGamut(L, mid, H)) lo = mid; else hi = mid;
  }
  return lo;
}
