/**
 * Code export generators for shape tokens (used in combined system export).
 */

import { generateShadows, type ShadowConfig, type ShadowType } from './shadows';
import { hexToOklch, oklchToHex } from './color-math';
import type { ColorMode, SeparationMode, ShapeState } from './shape-url-state';

export interface ShapeExportOptions {
  shadowEnabled: boolean;
  shadowType: ShadowType;
  shadowStrength: number;
  shadowBlurScale: number;
  shadowScale: number;
  shadowColorMode: ColorMode;
  shadowCustomColor: string;
  borderEnabled: boolean;
  borderWidth: number;
  borderRadius: number;
  glassEnabled: boolean;
  glassBlur: number;
  glassOpacity: number;
  ringWidth: number;
  ringOffset: number;
  separationMode: SeparationMode;
  surfaceHex: string;
}

const SHAPE_DEFAULTS: ShapeExportOptions = {
  shadowEnabled: true,
  shadowType: 'normal',
  shadowStrength: 1.0,
  shadowBlurScale: 1.0,
  shadowScale: 1.272,
  shadowColorMode: 'auto',
  shadowCustomColor: '#000000',
  borderEnabled: true,
  borderWidth: 1,
  borderRadius: 8,
  glassEnabled: false,
  glassBlur: 12,
  glassOpacity: 0.8,
  ringWidth: 2,
  ringOffset: 2,
  separationMode: 'shadow',
  surfaceHex: '#335A7F',
};

/** Build full options from partial decoded shape state. */
export function optsFromState(state: Partial<ShapeState> | null, surfaceHex?: string): ShapeExportOptions {
  return {
    ...SHAPE_DEFAULTS,
    ...state,
    surfaceHex: surfaceHex ?? state?.shadowCustomColor ?? SHAPE_DEFAULTS.surfaceHex,
  } as ShapeExportOptions;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function buildShadowConfig(opts: ShapeExportOptions): ShadowConfig {
  return {
    type: opts.shadowType,
    strength: opts.shadowStrength,
    blurScale: opts.shadowBlurScale,
    scale: opts.shadowScale,
    colorMode: opts.shadowColorMode,
    customColor: opts.shadowCustomColor,
  };
}

function deriveBgHex(surfaceHex: string, isDark: boolean): string {
  const [, , H] = hexToOklch(surfaceHex);
  const C = 0.015;
  return isDark ? oklchToHex(0.15, C, H) : oklchToHex(0.96, C * 0.3, H);
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
  return { normal: 'Normal', neumorphic: 'Neumorphic', flat: 'Flat' }[t];
}

function scaleLabel(scale: number): string {
  return Math.abs(scale - 1.272) < 0.001 ? '√φ' : scale.toFixed(3);
}

/* ------------------------------------------------------------------ */
/*  CSS Custom Properties                                             */
/* ------------------------------------------------------------------ */

export function generateShapeCss(opts: ShapeExportOptions): string {
  const config = buildShadowConfig(opts);
  const radii = radiusScale(opts.borderRadius);

  let css = `/* Shape Tokens — standby.design/shape */\n`;
  css += `:root {\n`;

  // Shadows (light)
  if (opts.shadowEnabled) {
    const lightBg = deriveBgHex(opts.surfaceHex, false);
    const lightShadows = generateShadows(lightBg, false, config);
    css += `  /* Shadows — ${shadowTypeLabel(opts.shadowType)}, scale ${scaleLabel(opts.shadowScale)} */\n`;
    for (const s of lightShadows) {
      css += `  --shadow-${s.name}: ${s.shadow};\n`;
    }
  } else {
    css += `  /* Shadows: disabled */\n`;
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

  // Glass
  if (opts.glassEnabled) {
    css += `\n  /* Glass / Blur */\n`;
    css += `  --glass-blur: ${opts.glassBlur}px;\n`;
    css += `  --glass-opacity: ${opts.glassOpacity};\n`;
  }

  css += `}\n`;

  // Dark overrides (only shadows change)
  if (opts.shadowEnabled) {
    const darkBg = deriveBgHex(opts.surfaceHex, true);
    const darkShadows = generateShadows(darkBg, true, config);
    css += `\n.dark {\n`;
    for (const s of darkShadows) {
      css += `  --shadow-${s.name}: ${s.shadow};\n`;
    }
    css += `}\n`;
  }

  css += `\n/* Surface separation strategy: ${opts.separationMode} */\n`;

  return css;
}

/* ------------------------------------------------------------------ */
/*  Tailwind v4                                                       */
/* ------------------------------------------------------------------ */

export function generateShapeTailwind(opts: ShapeExportOptions): string {
  const config = buildShadowConfig(opts);
  const radii = radiusScale(opts.borderRadius);

  let css = `/* Shape Tokens — standby.design/shape */\n`;

  // Mode-independent tokens in @theme
  css += `@theme {\n`;

  for (const [name, px] of Object.entries(radii)) {
    const varName = name === 'md' ? '--radius' : `--radius-${name}`;
    css += `  ${varName}: ${pxToRem(px)};\n`;
  }

  if (opts.borderEnabled && opts.borderWidth > 0) {
    css += `\n  --border-width: ${opts.borderWidth}px;\n`;
  }

  css += `\n  --ring-width: ${opts.ringWidth}px;\n`;
  css += `  --ring-offset: ${opts.ringOffset}px;\n`;

  if (opts.glassEnabled) {
    css += `\n  --glass-blur: ${opts.glassBlur}px;\n`;
    css += `  --glass-opacity: ${opts.glassOpacity};\n`;
  }

  css += `}\n`;

  // Shadows are mode-dependent
  if (opts.shadowEnabled) {
    const lightBg = deriveBgHex(opts.surfaceHex, false);
    const darkBg = deriveBgHex(opts.surfaceHex, true);
    const lightShadows = generateShadows(lightBg, false, config);
    const darkShadows = generateShadows(darkBg, true, config);

    css += `\n/* Shadows — ${shadowTypeLabel(opts.shadowType)}, scale ${scaleLabel(opts.shadowScale)} */\n`;
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
/*  LLM Briefing                                                      */
/* ------------------------------------------------------------------ */

export function generateLlmBriefing(opts: ShapeExportOptions): string {
  const config = buildShadowConfig(opts);
  const radii = radiusScale(opts.borderRadius);

  let md = `# Shape Tokens — standby.design/shape\n\n`;

  // Shadows
  md += `## Shadows\n\n`;
  if (opts.shadowEnabled) {
    md += `- **Style:** ${shadowTypeLabel(opts.shadowType)}\n`;
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
  md += `\n## Glass / Blur\n\n`;
  if (opts.glassEnabled) {
    md += `- **Blur:** ${opts.glassBlur}px\n`;
    md += `- **Opacity:** ${opts.glassOpacity}\n`;
  } else {
    md += `Glass effect is **disabled**.\n`;
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
