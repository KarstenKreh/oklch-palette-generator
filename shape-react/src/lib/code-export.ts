/**
 * Code export generators for shape tokens.
 */

import { generateShadows, type ShadowConfig, type ShadowType } from '@core/shadows';
import { generatePalette, type PaletteEntry, type Step } from '@core/palette';
import type { ColorMode, SeparationMode, ShapeStyle, BrutalistVariant } from '@/store/shape-store';

export interface ShapeExportOptions {
  shapeStyle: ShapeStyle;
  shadowEnabled: boolean;
  shadowType: ShadowType;
  shadowStrength: number;
  shadowBlurScale: number;
  shadowScale: number;
  shadowColorMode: ColorMode;
  shadowCustomColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  brutalistVariant: BrutalistVariant;
  borderEnabled: boolean;
  borderWidth: number;
  borderRadius: number;
  glassDepth: number;
  glassBlur: number;
  glassDispersion: number;
  ringWidth: number;
  ringOffset: number;
  separationMode: SeparationMode;
  surfaceHex: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function effectiveShadowType(opts: ShapeExportOptions): ShadowType {
  if (opts.shapeStyle === 'neomorph') return 'neumorphic';
  if (opts.shapeStyle === 'neobrutalism') return 'brutalist';
  return opts.shadowType;
}

function buildShadowConfig(opts: ShapeExportOptions): ShadowConfig {
  return {
    type: effectiveShadowType(opts),
    strength: opts.shadowStrength,
    blurScale: opts.shadowBlurScale,
    scale: opts.shadowScale,
    colorMode: opts.shadowColorMode,
    customColor: opts.shadowCustomColor,
    offsetX: opts.shadowOffsetX,
    offsetY: opts.shadowOffsetY,
    borderWidth: opts.borderEnabled ? opts.borderWidth : 1,
  };
}

function paletteStep(palette: PaletteEntry[], s: Step): string {
  return palette.find(e => e.step === s)!.hex;
}

/** Derive light / dark background hex using the real palette engine. */
function deriveBgHex(surfaceHex: string, isDark: boolean): string {
  const surface = generatePalette(surfaceHex, 0.1);
  return isDark ? paletteStep(surface, 875) : paletteStep(surface, 50);
}

function radiusScale(base: number) {
  return {
    xs: base / 4,
    sm: base / 2,
    md: base,
    lg: base * 1.5,
    xl: base * 2,
  } as Record<string, number>;
}

function pxToRem(px: number): string {
  return `${+(px / 16).toFixed(4)}rem`;
}

function shadowTypeLabel(t: ShadowType): string {
  return { normal: 'Normal', neumorphic: 'Neumorphic', flat: 'Flat', brutalist: 'Brutalist' }[t];
}

function scaleLabel(scale: number): string {
  return Math.abs(scale - 1.272) < 0.001 ? '√φ' : scale.toFixed(3);
}

/* ------------------------------------------------------------------ */
/*  CSS Custom Properties                                             */
/* ------------------------------------------------------------------ */

export function generateCssExport(opts: ShapeExportOptions): string {
  const config = buildShadowConfig(opts);
  const radii = radiusScale(opts.borderRadius);

  let css = `/* Shape Tokens — standby.design/shape */\n`;
  css += `:root {\n`;

  // Shadows (light) — only for paper style
  if (opts.shapeStyle !== 'glass' && opts.shadowEnabled) {
    const lightBg = deriveBgHex(opts.surfaceHex, false);
    const lightShadows = generateShadows(lightBg, false, config);
    css += `  /* Shadows — ${shadowTypeLabel(effectiveShadowType(opts))}, scale ${scaleLabel(opts.shadowScale)} */\n`;
    for (const s of lightShadows) {
      css += `  --shadow-${s.name}: ${s.shadow};\n`;
    }
  }

  // Border Radius
  css += `\n  /* Border Radius */\n`;
  for (const [name, px] of Object.entries(radii)) {
    const varName = name === 'md' ? '--radius' : `--radius-${name}`;
    css += `  ${varName}: ${pxToRem(px)};\n`;
  }

  // Border
  if (opts.borderEnabled && opts.borderWidth > 0) {
    css += `\n  /* Border */\n`;
    css += `  --border-width: ${opts.borderWidth}px;\n`;
  }

  // Ring
  css += `\n  /* Focus Ring */\n`;
  css += `  --ring-width: ${opts.ringWidth}px;\n`;
  css += `  --ring-offset: ${opts.ringOffset}px;\n`;

  // Glass (Liquid Glass — use with liquid-glass-react or similar)
  if (opts.shapeStyle === 'glass') {
    css += `\n  /* Liquid Glass */\n`;
    css += `  --glass-depth: ${opts.glassDepth};\n`;
    css += `  --glass-blur: ${opts.glassBlur};\n`;
    css += `  --glass-dispersion: ${opts.glassDispersion};\n`;
  }

  css += `}\n`;

  // Dark overrides (only shadows, only for paper style)
  if (opts.shapeStyle !== 'glass' && opts.shadowEnabled) {
    const darkBg = deriveBgHex(opts.surfaceHex, true);
    const darkShadows = generateShadows(darkBg, true, config);
    css += `\n.dark {\n`;
    for (const s of darkShadows) {
      css += `  --shadow-${s.name}: ${s.shadow};\n`;
    }
    css += `}\n`;
  }

  // Separation mode (informational)
  css += `\n/* Surface separation strategy: ${opts.separationMode} */\n`;

  return css;
}

/* ------------------------------------------------------------------ */
/*  Tailwind v4                                                       */
/* ------------------------------------------------------------------ */

export function generateTailwindV4Export(opts: ShapeExportOptions): string {
  const config = buildShadowConfig(opts);
  const radii = radiusScale(opts.borderRadius);

  let css = `/* Shape Tokens — standby.design/shape */\n`;

  // Mode-independent tokens in @theme
  css += `@theme {\n`;

  // Border Radius
  for (const [name, px] of Object.entries(radii)) {
    const varName = name === 'md' ? '--radius' : `--radius-${name}`;
    css += `  ${varName}: ${pxToRem(px)};\n`;
  }

  // Border
  if (opts.borderEnabled && opts.borderWidth > 0) {
    css += `\n  --border-width: ${opts.borderWidth}px;\n`;
  }

  // Ring
  css += `\n  --ring-width: ${opts.ringWidth}px;\n`;
  css += `  --ring-offset: ${opts.ringOffset}px;\n`;

  // Glass (Liquid Glass — use with liquid-glass-react or similar)
  if (opts.shapeStyle === 'glass') {
    css += `\n  /* Liquid Glass */\n`;
    css += `  --glass-depth: ${opts.glassDepth};\n`;
    css += `  --glass-blur: ${opts.glassBlur};\n`;
    css += `  --glass-dispersion: ${opts.glassDispersion};\n`;
  }

  css += `}\n`;

  // Shadows are mode-dependent → CSS custom properties (paper only)
  if (opts.shapeStyle !== 'glass' && opts.shadowEnabled) {
    const lightBg = deriveBgHex(opts.surfaceHex, false);
    const darkBg = deriveBgHex(opts.surfaceHex, true);
    const lightShadows = generateShadows(lightBg, false, config);
    const darkShadows = generateShadows(darkBg, true, config);

    css += `\n/* Shadows — ${shadowTypeLabel(effectiveShadowType(opts))}, scale ${scaleLabel(opts.shadowScale)} */\n`;
    css += `/* Mode-dependent: use CSS custom properties with darkMode: "class" */\n`;
    css += `:root {\n`;
    for (const s of lightShadows) {
      css += `  --shadow-${s.name}: ${s.shadow};\n`;
    }
    css += `}\n`;
    css += `.dark {\n`;
    for (const s of darkShadows) {
      css += `  --shadow-${s.name}: ${s.shadow};\n`;
    }
    css += `}\n`;
  }

  css += `\n/* Surface separation strategy: ${opts.separationMode} */\n`;

  return css;
}

/* ------------------------------------------------------------------ */
/*  W3C Design Tokens (DTCG JSON)                                     */
/* ------------------------------------------------------------------ */

export function generateDesignTokensExport(opts: ShapeExportOptions): string {
  const config = buildShadowConfig(opts);
  const radii = radiusScale(opts.borderRadius);

  const tokens: Record<string, unknown> = {};

  // Shadows (paper only)
  if (opts.shapeStyle !== 'glass' && opts.shadowEnabled) {
    const lightBg = deriveBgHex(opts.surfaceHex, false);
    const darkBg = deriveBgHex(opts.surfaceHex, true);
    const lightShadows = generateShadows(lightBg, false, config);
    const darkShadows = generateShadows(darkBg, true, config);

    const shadow: Record<string, unknown> = {};
    for (let i = 0; i < lightShadows.length; i++) {
      shadow[lightShadows[i].name] = {
        $type: 'shadow',
        $value: {
          light: lightShadows[i].shadow,
          dark: darkShadows[i].shadow,
        },
      };
    }
    tokens.shadow = shadow;
  }

  // Border Radius
  const borderRadius: Record<string, unknown> = {};
  for (const [name, px] of Object.entries(radii)) {
    borderRadius[name] = {
      $type: 'dimension',
      $value: pxToRem(px),
    };
  }
  tokens.borderRadius = borderRadius;

  // Border
  if (opts.borderEnabled && opts.borderWidth > 0) {
    tokens.borderWidth = {
      $type: 'dimension',
      $value: `${opts.borderWidth}px`,
    };
  }

  // Ring
  tokens.ring = {
    width: { $type: 'dimension', $value: `${opts.ringWidth}px` },
    offset: { $type: 'dimension', $value: `${opts.ringOffset}px` },
  };

  // Glass
  if (opts.shapeStyle === 'glass') {
    tokens.glass = {
      depth: { $type: 'number', $value: opts.glassDepth },
      blur: { $type: 'number', $value: opts.glassBlur },
      dispersion: { $type: 'number', $value: opts.glassDispersion },
    };
  }

  // Separation
  tokens.surfaceSeparation = {
    $type: 'string',
    $value: opts.separationMode,
  };

  return JSON.stringify(tokens, null, 2);
}

/* ------------------------------------------------------------------ */
/*  LLM Briefing                                                      */
/* ------------------------------------------------------------------ */

export function generateLlmBriefing(opts: ShapeExportOptions): string {
  const config = buildShadowConfig(opts);
  const radii = radiusScale(opts.borderRadius);

  let md = `# Shape Tokens — standby.design/shape\n\n`;

  const styleLabel =
    opts.shapeStyle === 'paper' ? 'Paper' :
    opts.shapeStyle === 'glass' ? 'Glass (Liquid Glass)' :
    opts.shapeStyle === 'neomorph' ? 'Neomorph (Soft UI)' :
    `Neobrutalism (${opts.brutalistVariant})`;
  md += `**Style:** ${styleLabel}\n\n`;

  if (opts.shapeStyle === 'neomorph') {
    md += `## Neomorph Notes\n\n`;
    md += `- **Monochromatic surface:** Cards, muted, and elevated layers share the parent background color. Depth comes from dual shadows (light top-left + dark bottom-right), not color contrast.\n`;
    md += `- **Accessibility:** Low surface/background contrast is inherent to the style. Ensure text and interactive elements meet WCAG AA (4.5:1) against their own backgrounds — the preview flags sub-threshold buttons.\n`;
    md += `- **Pressed states:** Mirror the same shadow values with \`inset\` to create a depressed effect for active/pressed buttons.\n`;
    md += `- **Border default:** 0 by design. Raise \`--border-width\` only if you need extra separation.\n\n`;
  }

  if (opts.shapeStyle === 'neobrutalism') {
    md += `## Neobrutalism Notes\n\n`;
    md += `- **Offset outline shadow:** A solid hollow rectangle sits behind each surface at offset (${opts.shadowOffsetX}px, ${opts.shadowOffsetY}px). Generated as a stacked \`box-shadow\` with zero blur.\n`;
    md += `- **Variant:** \`${opts.brutalistVariant}\` — outlined renders a hollow echo with the surface's border color; solid fills the echo with the border color (no stroke).\n`;
    md += `- **Borders carry the style:** Each surface has an explicit stroke matching the echo color (derived from the surface's own bg, one palette step darker). Borders are required, not optional.\n`;
    md += `- **No blur, no soft shadows:** This style is flat and hard-edged by design. Do not mix with gaussian drop shadows.\n`;
    md += `- **Color ladder:** xs–xl levels scale the offset by the shadow scale (\`${scaleLabel(opts.shadowScale)}\`), so elevation reads even though all shadows are hard.\n\n`;
  }

  // Shadows (paper + neomorph — skipped for glass)
  if (opts.shapeStyle !== 'glass') {
  md += `## Shadows\n\n`;
  if (opts.shadowEnabled) {
    md += `- **Style:** ${shadowTypeLabel(effectiveShadowType(opts))}\n`;
    md += `- **Scale:** ${scaleLabel(opts.shadowScale)} (5 levels: xs, sm, md, lg, xl)\n`;
    md += `- **Strength:** ${opts.shadowStrength}\n`;
    md += `- **Blur scale:** ${opts.shadowBlurScale}\n`;
    md += `- **Color mode:** ${opts.shadowColorMode}${opts.shadowColorMode === 'custom' ? ` (${opts.shadowCustomColor})` : ''}\n\n`;

    const lightBg = deriveBgHex(opts.surfaceHex, false);
    const darkBg = deriveBgHex(opts.surfaceHex, true);
    const lightShadows = generateShadows(lightBg, false, config);
    const darkShadows = generateShadows(darkBg, true, config);

    md += `### Light mode\n\n`;
    md += `| Level | box-shadow |\n|-------|------------|\n`;
    for (const s of lightShadows) md += `| ${s.name} | \`${s.shadow}\` |\n`;

    md += `\n### Dark mode\n\n`;
    md += `| Level | box-shadow |\n|-------|------------|\n`;
    for (const s of darkShadows) md += `| ${s.name} | \`${s.shadow}\` |\n`;
  } else {
    md += `Shadows are **disabled**.\n`;
  }
  } // end paper-only shadows

  // Border Radius
  md += `\n## Border Radius\n\n`;
  md += `Base: ${opts.borderRadius}px\n\n`;
  md += `| Token | Value |\n|-------|-------|\n`;
  for (const [name, px] of Object.entries(radii)) {
    const token = name === 'md' ? '--radius' : `--radius-${name}`;
    md += `| ${token} | ${pxToRem(px)} (${px}px) |\n`;
  }

  // Border
  md += `\n## Border\n\n`;
  if (opts.borderEnabled && opts.borderWidth > 0) {
    md += `- **Width:** ${opts.borderWidth}px\n`;
  } else {
    md += `Borders are **disabled**.\n`;
  }

  // Ring
  md += `\n## Focus Ring\n\n`;
  md += `- **Width:** ${opts.ringWidth}px\n`;
  md += `- **Offset:** ${opts.ringOffset}px\n`;

  // Glass
  md += `\n## Liquid Glass\n\n`;
  if (opts.shapeStyle === 'glass') {
    md += `Implemented as a self-contained SVG filter + \`backdrop-filter\` component (no external runtime dependency).\n\n`;
    md += `- **Depth:** ${opts.glassDepth} (displacement intensity)\n`;
    md += `- **Blur:** ${opts.glassBlur} (backdrop blur multiplier)\n`;
    md += `- **Dispersion:** ${opts.glassDispersion} (chromatic aberration)\n`;
    md += `\nDisplacement is driven by an SVG \`<feDisplacementMap>\` with 35% filter padding (no edge clipping). Backdrop blur and saturation use the native CSS \`backdrop-filter\`. Chromatic aberration is produced by three \`feDisplacementMap\` passes with per-channel scale offsets.\n`;
  } else {
    md += `Liquid glass effect is **disabled**.\n`;
  }

  // Separation
  md += `\n## Surface Separation\n\n`;
  md += `Strategy: **${opts.separationMode}**\n`;
  const descriptions: Record<SeparationMode, string> = {
    shadow: 'Surfaces are separated using box-shadow elevation.',
    border: 'Surfaces are separated using visible borders.',
    contrast: 'Surfaces are separated using background-color contrast.',
    gap: 'Surfaces are separated using whitespace (gap/padding).',
    mixed: 'Surfaces use a combination of shadow, border, and contrast.',
  };
  md += `${descriptions[opts.separationMode]}\n`;

  // Usage hint
  md += `\n## Usage\n\n`;
  md += `Use the CSS custom properties from the CSS or Tailwind export.\n`;
  md += `Shadows are mode-dependent — define both \`:root\` and \`.dark\` blocks.\n`;
  md += `Combine with color tokens from standby.design/color and type tokens from standby.design/type.\n`;

  return md;
}
