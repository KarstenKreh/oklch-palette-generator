/**
 * Comprehensive validation script for the OKLCH Palette Generator.
 * Run with: npx tsx test-validation.ts
 */

import { hexToOklch, oklchToHex, hexToRgb, contrastRatio, isInGamut, maxChromaInGamut, rgbToHsv, hsvToRgb, rgbToHsl, hslToRgb } from './src/lib/color-math';
import { generatePalette, computeAutoErrorHex, STEPS, L_WHITE, L_BLACK } from './src/lib/palette';
import { generateSemantic, generatePrimitivesOklch } from './src/lib/code-export';
import { generateShadowValues } from './src/lib/shadows';
import { encodeState, decodeState } from './src/lib/url-state';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, name: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(name);
    console.log(`  FAIL: ${name}`);
  }
}

function section(name: string) {
  console.log(`\n── ${name} ──`);
}

// ═══════════════════════════════════════════════════════════
// 1. COLOR MATH — Roundtrip conversions
// ═══════════════════════════════════════════════════════════
section('1. Color Math — Hex↔OKLCH roundtrip');

const testColors = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000',
  '#335A7F', '#C42525', '#7C3AED', '#F59E0B', '#10B981',
  '#808080', '#FF8800', '#123456', '#ABCDEF', '#FFC0CB',
];

for (const hex of testColors) {
  const [L, C, H] = hexToOklch(hex);
  const back = oklchToHex(L, C, H);
  const [r1, g1, b1] = hexToRgb(hex);
  const [r2, g2, b2] = hexToRgb(back);
  const maxDiff = Math.max(Math.abs(r1 - r2), Math.abs(g1 - g2), Math.abs(b1 - b2));
  assert(maxDiff <= 1, `Roundtrip ${hex} → oklch → ${back} (diff=${maxDiff})`);
}

section('1b. Color Math — OKLCH values sanity');
for (const hex of testColors) {
  const [L, C, H] = hexToOklch(hex);
  assert(L >= 0 && L <= 1, `L in [0,1] for ${hex}: ${L.toFixed(4)}`);
  assert(C >= 0 && C <= 0.4, `C in [0,0.4] for ${hex}: ${C.toFixed(4)}`);
  assert(H >= 0 && H < 360, `H in [0,360) for ${hex}: ${H.toFixed(2)}`);
}

section('1c. Color Math — HSV/HSL roundtrips');
for (const hex of testColors) {
  const [r, g, b] = hexToRgb(hex);
  // HSV roundtrip
  const [h, s, v] = rgbToHsv(r, g, b);
  const [r2, g2, b2] = hsvToRgb(h, s, v);
  assert(Math.abs(r - r2) <= 1 && Math.abs(g - g2) <= 1 && Math.abs(b - b2) <= 1,
    `HSV roundtrip ${hex}`);
  // HSL roundtrip
  const [hh, ss, ll] = rgbToHsl(r, g, b);
  const [r3, g3, b3] = hslToRgb(hh, ss, ll);
  assert(Math.abs(r - r3) <= 1 && Math.abs(g - g3) <= 1 && Math.abs(b - b3) <= 1,
    `HSL roundtrip ${hex}`);
}

section('1d. Contrast ratio');
assert(contrastRatio('#FFFFFF', '#000000') > 20, 'White/Black contrast > 20');
assert(contrastRatio('#FFFFFF', '#FFFFFF') < 1.1, 'White/White contrast ≈ 1');
assert(contrastRatio('#000000', '#000000') < 1.1, 'Black/Black contrast ≈ 1');
// Symmetry
const cr1 = contrastRatio('#335A7F', '#FFFFFF');
const cr2 = contrastRatio('#FFFFFF', '#335A7F');
assert(Math.abs(cr1 - cr2) < 0.001, `Contrast ratio symmetric: ${cr1.toFixed(2)} vs ${cr2.toFixed(2)}`);

// ═══════════════════════════════════════════════════════════
// 2. PALETTE GENERATION
// ═══════════════════════════════════════════════════════════
section('2. Palette — Structure');

const seedColors = ['#335A7F', '#C42525', '#7C3AED', '#F59E0B', '#10B981', '#FF0000', '#000000', '#FFFFFF', '#808080'];

for (const seed of seedColors) {
  const pal = generatePalette(seed, 1.0, 'balanced');
  assert(pal.length === 18, `${seed} balanced: 18 steps (got ${pal.length})`);

  // Check all expected steps present
  const steps = pal.map(e => e.step);
  for (const s of STEPS) {
    assert(steps.includes(s), `${seed}: step ${s} present`);
  }
}

section('2b. Palette — Lightness monotonically decreasing');
// Skip pure black/white in exact mode — L_MID equals the extreme, causing non-monotone interpolation
const monotoneSeeds = seedColors.filter(s => s !== '#000000' && s !== '#FFFFFF');
for (const seed of monotoneSeeds) {
  for (const mode of ['balanced', 'exact'] as const) {
    const pal = generatePalette(seed, 1.0, mode);
    let monotonic = true;
    for (let i = 1; i < pal.length; i++) {
      if (pal[i].L > pal[i - 1].L + 0.001) {
        monotonic = false;
        break;
      }
    }
    assert(monotonic, `${seed} ${mode}: L monotonically decreasing`);
  }
}
// Black/white in balanced mode should still be monotone
for (const seed of ['#000000', '#FFFFFF']) {
  const pal = generatePalette(seed, 1.0, 'balanced');
  let monotonic = true;
  for (let i = 1; i < pal.length; i++) {
    if (pal[i].L > pal[i - 1].L + 0.001) { monotonic = false; break; }
  }
  assert(monotonic, `${seed} balanced: L monotonically decreasing`);
}

section('2c. Palette — All colors in sRGB gamut');
let gamutOk = 0;
let gamutFail = 0;
for (const seed of seedColors) {
  for (const cs of [0.25, 0.5, 1.0]) {
    for (const mode of ['balanced', 'exact'] as const) {
      const pal = generatePalette(seed, cs, mode);
      for (const entry of pal) {
        const [r, g, b] = hexToRgb(entry.hex);
        if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
          gamutOk++;
        } else {
          gamutFail++;
        }
      }
    }
  }
}
assert(gamutFail === 0, `All palette entries in sRGB gamut (${gamutOk} ok, ${gamutFail} fail)`);

section('2d. Palette — Lightness endpoints');
for (const seed of seedColors.slice(0, 3)) {
  const pal = generatePalette(seed, 1.0, 'balanced');
  const l25 = pal.find(e => e.step === 25)!.L;
  const l975 = pal.find(e => e.step === 975)!.L;
  // Step 25 is interpolated (not exactly L_WHITE), but should be very light (>0.9)
  assert(l25 > 0.9, `${seed}: step 25 L very light (${l25.toFixed(4)})`);
  // Step 975 should be very dark (<0.15)
  assert(l975 < 0.15, `${seed}: step 975 L very dark (${l975.toFixed(4)})`);
}

section('2e. Palette — Surface chroma correction reduces dark chroma');
for (const seed of ['#335A7F', '#7C3AED']) {
  const action = generatePalette(seed, 1.0, 'balanced');
  const surface = generatePalette(seed, 0.25, 'balanced');
  const surfStep875 = surface.find(e => e.step === 875)!;
  const surfStep50 = surface.find(e => e.step === 50)!;
  // Dark surfaces should have reduced chroma compared to an uncorrected version
  // The correction formula is pow(L/0.45, 1.2) for L < 0.45
  // At step 875 (L≈0.153), correction = pow(0.153/0.45, 1.2) ≈ 0.26
  // So dark chroma should be notably less than light chroma
  if (surfStep50.C > 0.001) {
    const ratio = surfStep875.C / surfStep50.C;
    assert(ratio < 1.0, `${seed}: dark surface chroma < light surface chroma (ratio=${ratio.toFixed(3)})`);
  }
}

section('2f. Palette — Exact mode: step 500 matches input lightness');
for (const seed of ['#335A7F', '#C42525', '#7C3AED']) {
  const [bL] = hexToOklch(seed);
  const pal = generatePalette(seed, 1.0, 'exact');
  const step500 = pal.find(e => e.step === 500)!;
  assert(Math.abs(step500.L - bL) < 0.001, `${seed} exact: step 500 L=${step500.L.toFixed(4)} ≈ input L=${bL.toFixed(4)}`);
}

section('2g. Auto Error derivation');
for (const seed of ['#335A7F', '#7C3AED', '#10B981']) {
  const errorHex = computeAutoErrorHex(seed);
  const [eL, eC, eH] = hexToOklch(errorHex);
  assert(Math.abs(eH - 25) < 1, `${seed} auto-error hue ≈ 25° (got ${eH.toFixed(1)})`);
  assert(isInGamut(eL, eC, eH), `${seed} auto-error in gamut`);
}

// ═══════════════════════════════════════════════════════════
// 3. SEMANTIC TOKENS — Completeness & Spec compliance
// ═══════════════════════════════════════════════════════════
section('3. Semantic Tokens — Completeness');

const brand = generatePalette('#335A7F', 1.0, 'balanced');
const surface = generatePalette('#335A7F', 0.25, 'balanced');
const error = generatePalette('#CC3333', 1.0, 'balanced');
const errorSurface = generatePalette('#CC3333', 0.25, 'balanced');
const neutral = generatePalette('#808080', 0, 'balanced');
// Extend neutral with 0 and 1000
const neutralExtended = [
  { step: 0, L: 1.0, C: 0, H: 0, hex: '#FFFFFF', css: 'oklch(1 0 0)' },
  ...neutral,
  { step: 1000, L: 0, C: 0, H: 0, hex: '#000000', css: 'oklch(0 0 0)' },
] as any;

const semantic = generateSemantic([], brand, error, errorSurface, surface, false, null, false, null, 'best', 'Test Theme');

const requiredLightTokens = [
  '--background:', '--foreground:',
  '--card:', '--card-foreground:',
  '--popover:', '--popover-foreground:',
  '--primary:', '--primary-foreground:',
  '--secondary:', '--secondary-foreground:',
  '--muted:', '--muted-foreground:',
  '--accent:', '--accent-foreground:',
  '--destructive:', '--destructive-foreground:',
  '--destructive-subtle:', '--destructive-subtle-foreground:',
  '--destructive-border:',
  '--border:', '--border-muted:', '--input:', '--ring:',
  '--shadow-xs:', '--shadow-sm:', '--shadow-md:', '--shadow-lg:', '--shadow-xl:',
  '--sidebar:', '--sidebar-foreground:',
  '--sidebar-primary:', '--sidebar-primary-foreground:',
  '--sidebar-accent:', '--sidebar-accent-foreground:',
  '--sidebar-border:', '--sidebar-ring:',
];

for (const token of requiredLightTokens) {
  assert(semantic.includes(token), `Semantic contains ${token}`);
}

section('3b. Semantic Tokens — Spec step values');
// Light mode checks
assert(semantic.includes('--background: var(--color-surface-50)'), 'Light: background = surface-50');
assert(semantic.includes('--foreground: var(--color-surface-975)'), 'Light: foreground = surface-975');
assert(semantic.includes('--card: var(--color-surface-25)'), 'Light: card = surface-25');
assert(semantic.includes('--primary: var(--color-brand-600)'), 'Light: primary = brand-600');
assert(semantic.includes('--secondary: var(--color-brand-200)'), 'Light: secondary = brand-200');
assert(semantic.includes('--muted: var(--color-surface-75)'), 'Light: muted = surface-75');
assert(semantic.includes('--accent: var(--color-brand-100)'), 'Light: accent = brand-100');
assert(semantic.includes('--destructive: var(--color-error-600)'), 'Light: destructive = error-600');
assert(semantic.includes('--destructive-subtle: var(--color-error-100)'), 'Light: destructive-subtle = error-100');
assert(semantic.includes('--destructive-border: var(--color-error-surface-300)'), 'Light: destructive-border = error-surface-300');
assert(semantic.includes('--border: var(--color-surface-300)'), 'Light: border = surface-300');
assert(semantic.includes('--border-muted: var(--color-surface-200)'), 'Light: border-muted = surface-200');
assert(semantic.includes('--input: var(--color-surface-300)'), 'Light: input = surface-300');
assert(semantic.includes('--ring: var(--color-surface-400)'), 'Light: ring = surface-400');

// Dark mode checks (in .dark block)
const darkBlock = semantic.split('.dark')[1] || '';
assert(darkBlock.includes('--background: var(--color-surface-875)'), 'Dark: background = surface-875');
assert(darkBlock.includes('--foreground: var(--color-surface-25)'), 'Dark: foreground = surface-25');
assert(darkBlock.includes('--card: var(--color-surface-825)'), 'Dark: card = surface-825');
assert(darkBlock.includes('--popover: var(--color-surface-800)'), 'Dark: popover = surface-800');
assert(darkBlock.includes('--primary: var(--color-brand-400)'), 'Dark: primary = brand-400');
assert(darkBlock.includes('--secondary: var(--color-brand-800)'), 'Dark: secondary = brand-800');
assert(darkBlock.includes('--muted: var(--color-surface-850)'), 'Dark: muted = surface-850');
assert(darkBlock.includes('--accent: var(--color-brand-800)'), 'Dark: accent = brand-800');
assert(darkBlock.includes('--destructive: var(--color-error-400)'), 'Dark: destructive = error-400');
assert(darkBlock.includes('--border: var(--color-surface-600)'), 'Dark: border = surface-600');
assert(darkBlock.includes('--border-muted: var(--color-surface-700)'), 'Dark: border-muted = surface-700');
assert(darkBlock.includes('--input: var(--color-surface-700)'), 'Dark: input = surface-700');
assert(darkBlock.includes('--ring: var(--color-surface-500)'), 'Dark: ring = surface-500');

section('3c. Semantic — Dark elevation order');
// background(875) < muted(850) < card(825) < popover(800) — numerically descending = lighter
assert(darkBlock.includes('surface-875') && darkBlock.includes('surface-825') && darkBlock.includes('surface-800'),
  'Dark mode uses 875/825/800 elevation steps');

// ═══════════════════════════════════════════════════════════
// 4. CONTRAST — Foreground/Background pairs pass WCAG AA
// ═══════════════════════════════════════════════════════════
section('4. Contrast — Key pairs ≥ 4.5:1');

const brandMap = Object.fromEntries(brand.map(e => [e.step, e]));
const surfMap = Object.fromEntries(surface.map(e => [e.step, e]));
const errMap = Object.fromEntries(error.map(e => [e.step, e]));

const contrastPairs: [string, string, string][] = [
  // [label, bg hex, fg hex]
  ['Light: foreground on background', surfMap[50].hex, surfMap[975].hex],
  ['Light: card-fg on card', surfMap[25].hex, surfMap[975].hex],
  ['Light: muted-fg on muted', surfMap[75].hex, surfMap[700].hex],
  ['Dark: foreground on background', surfMap[875].hex, surfMap[25].hex],
  ['Dark: card-fg on card', surfMap[825].hex, surfMap[25].hex],
  ['Dark: muted-fg on muted', surfMap[850].hex, surfMap[300].hex],
];

for (const [label, bg, fg] of contrastPairs) {
  const cr = contrastRatio(bg, fg);
  assert(cr >= 4.5, `${label}: ${cr.toFixed(2)}:1 (need ≥4.5)`);
}

// ═══════════════════════════════════════════════════════════
// 5. SHADOWS
// ═══════════════════════════════════════════════════════════
section('5. Shadows');

const lightShadows = generateShadowValues('#F8F8F8', false);
const darkShadows = generateShadowValues('#1A1A1A', true);

assert(lightShadows.length === 5, `Light shadows: 5 levels (got ${lightShadows.length})`);
assert(darkShadows.length === 5, `Dark shadows: 5 levels (got ${darkShadows.length})`);

const expectedNames = ['xs', 'sm', 'md', 'lg', 'xl'];
for (let i = 0; i < 5; i++) {
  assert(lightShadows[i].name === expectedNames[i], `Shadow level name: ${expectedNames[i]}`);
  assert(lightShadows[i].shadow.includes('oklch('), `Shadow ${expectedNames[i]} uses oklch()`);
  // Each shadow has 2 layers (comma-separated)
  assert(lightShadows[i].shadow.split(',').length >= 2, `Shadow ${expectedNames[i]} has 2+ layers`);
}

// ═══════════════════════════════════════════════════════════
// 6. URL STATE — Roundtrip
// ═══════════════════════════════════════════════════════════
section('6. URL State — Encode/Decode roundtrip');

const state = {
  brandHex: '#335A7F',
  bgColorHex: '#335A7F',
  bgAutoMatch: true,
  errorColorHex: '#CC3333',
  errorAutoMatch: true,
  chromaScale: 0.25,
  currentMode: 'balanced' as const,
  brandPin: false,
  errorPin: false,
  fgContrastMode: 'best' as const,
  themeName: 'My Cool Theme',
  extraAccents: [
    { name: 'Warning', hex: '#F59E0B', pin: false },
    { name: 'Success', hex: '#10B981', pin: true },
  ],
};

const encoded = encodeState(state);
const decoded = decodeState(encoded);

assert(decoded !== null, 'Decode returns non-null');
if (decoded) {
  assert(decoded.brandHex === '#335A7F', `Brand hex: ${decoded.brandHex}`);
  assert(decoded.bgAutoMatch === true, `bgAutoMatch: ${decoded.bgAutoMatch}`);
  assert(decoded.errorColorHex === '#CC3333', `Error hex: ${decoded.errorColorHex}`);
  assert(decoded.errorAutoMatch === true, `errorAutoMatch: ${decoded.errorAutoMatch}`);
  assert(decoded.chromaScale === 0.25, `chromaScale: ${decoded.chromaScale}`);
  assert(decoded.currentMode === 'balanced', `mode: ${decoded.currentMode}`);
  assert(decoded.brandPin === false, `brandPin: ${decoded.brandPin}`);
  assert(decoded.errorPin === false, `errorPin: ${decoded.errorPin}`);
  assert(decoded.fgContrastMode === 'best', `fgContrastMode: ${decoded.fgContrastMode}`);
  assert(decoded.themeName === 'My Cool Theme', `themeName: ${decoded.themeName}`);
  assert(decoded.extraAccents.length === 2, `accents count: ${decoded.extraAccents.length}`);
  assert(decoded.extraAccents[0].name === 'Warning', `accent 0 name: ${decoded.extraAccents[0].name}`);
  assert(decoded.extraAccents[0].hex === '#F59E0B', `accent 0 hex: ${decoded.extraAccents[0].hex}`);
  assert(decoded.extraAccents[1].pin === true, `accent 1 pin: ${decoded.extraAccents[1].pin}`);
}

section('6b. URL State — Edge cases');
assert(decodeState('') === null, 'Empty string → null');
assert(decodeState('invalid') === null, 'Invalid string → null');
assert(decodeState('XX') === null, 'Too short → null');

// Minimal valid
const minDecoded = decodeState('335A7F,335A7F,1,CC3333,1,25,balanced');
assert(minDecoded !== null, 'Minimal valid URL parses');

// ═══════════════════════════════════════════════════════════
// 7. EDGE CASES — Extreme inputs
// ═══════════════════════════════════════════════════════════
section('7. Edge Cases');

// Pure white
const whitePal = generatePalette('#FFFFFF', 1.0, 'balanced');
assert(whitePal.length === 18, 'White input: 18 steps');
assert(whitePal.every(e => e.C < 0.001), 'White input: all chroma ≈ 0 (achromatic)');

// Pure black
const blackPal = generatePalette('#000000', 1.0, 'balanced');
assert(blackPal.length === 18, 'Black input: 18 steps');

// Fully saturated red
const redPal = generatePalette('#FF0000', 1.0, 'balanced');
assert(redPal.length === 18, 'Red input: 18 steps');
let allRedInGamut = true;
for (const e of redPal) {
  const [r, g, b] = hexToRgb(e.hex);
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) allRedInGamut = false;
}
assert(allRedInGamut, 'Red palette: all in sRGB gamut');

// Zero chroma scale
const zeroPal = generatePalette('#335A7F', 0, 'balanced');
assert(zeroPal.every(e => e.C < 0.001), 'chromaScale=0: all chroma ≈ 0');

// 100% chroma scale
const fullPal = generatePalette('#335A7F', 1.0, 'exact');
const step500 = fullPal.find(e => e.step === 500)!;
const [, inputC] = hexToOklch('#335A7F');
assert(Math.abs(step500.C - inputC) < 0.001, 'chromaScale=1 exact: step 500 chroma = input chroma');

// Gamut boundary
section('7b. Gamut boundary — maxChromaInGamut');
for (const L of [0.1, 0.3, 0.5, 0.7, 0.9]) {
  for (const H of [0, 60, 120, 180, 240, 300]) {
    const maxC = maxChromaInGamut(L, H);
    assert(isInGamut(L, maxC, H), `maxChroma L=${L} H=${H}: in gamut at C=${maxC.toFixed(4)}`);
    assert(!isInGamut(L, maxC + 0.01, H), `maxChroma L=${L} H=${H}: out of gamut at C=${(maxC + 0.01).toFixed(4)}`);
  }
}

// ═══════════════════════════════════════════════════════════
// 8. PRIMITIVES EXPORT — Structure check
// ═══════════════════════════════════════════════════════════
section('8. Primitives Export');

const primExport = generatePrimitivesOklch(brand, surface, error, errorSurface, neutralExtended, [], 0.25, null, 'Test');
assert(primExport.includes(':root {'), 'Primitives: contains :root block');
assert(primExport.includes('--color-brand-'), 'Primitives: has brand tokens');
assert(primExport.includes('--color-surface-'), 'Primitives: has surface tokens');
assert(primExport.includes('--color-error-'), 'Primitives: has error tokens');
assert(primExport.includes('--color-error-surface-'), 'Primitives: has error-surface tokens');
assert(primExport.includes('--color-neutral-'), 'Primitives: has neutral tokens');
assert(primExport.includes('oklch('), 'Primitives OKLCH: uses oklch() values');

// Count token lines
const tokenLines = primExport.split('\n').filter(l => l.trim().startsWith('--color-'));
// Expected: brand(18) + surface(18) + error(18) + error-surface(18) + neutral(20 with 0 and 1000) = 92
assert(tokenLines.length >= 90, `Primitives: ${tokenLines.length} token lines (expect ≥90)`);

// ═══════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════
console.log('\n════════════════════════════════════════');
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
if (failures.length > 0) {
  console.log('\nFailed tests:');
  failures.forEach(f => console.log(`  ✗ ${f}`));
}
console.log('════════════════════════════════════════');
process.exit(failed > 0 ? 1 : 0);
