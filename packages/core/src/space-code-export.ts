/**
 * Code export for spacing + layout tokens. Shared between space-react and system-react.
 */

import type { SpacingToken } from './spacing';
import type { Breakpoint, Container } from './layout';
import type { AspectRatio } from './aspect';
import { formatAspect, expandAndSortAspects } from './aspect';
import { sortBreakpoints, sortContainers } from './layout';

export interface SpaceExportOptions {
  spacingTokens: SpacingToken[];
  breakpoints: Breakpoint[];
  fluidMinVw: number;
  fluidMaxVw: number;
  containers: Container[];
  proseMaxCh: number;
  aspectRatios: AspectRatio[];
  includeReciprocals: boolean;
  ratioLabel: string;
}

const expandAspects = expandAndSortAspects;

/** CSS Custom Properties */
export function generateSpaceCss(opts: SpaceExportOptions): string {
  const { spacingTokens, breakpoints, fluidMinVw, fluidMaxVw, containers, proseMaxCh, aspectRatios, includeReciprocals, ratioLabel } = opts;

  const bps = sortBreakpoints(breakpoints);
  const cts = sortContainers(containers);
  const ars = expandAspects(aspectRatios, includeReciprocals);

  let css = `/* Space — ${ratioLabel} */\n:root {\n`;

  css += `  /* Spacing Scale */\n`;
  for (const t of spacingTokens) {
    css += `  --space-${t.name}: ${t.rem}rem;\n`;
  }

  css += `\n  /* Breakpoints */\n`;
  for (const b of bps) {
    css += `  --breakpoint-${b.name}: ${b.minPx}px;\n`;
  }
  css += `  --fluid-min-vw: ${fluidMinVw}px;\n`;
  css += `  --fluid-max-vw: ${fluidMaxVw}px;\n`;

  css += `\n  /* Containers */\n`;
  for (const c of cts) {
    css += `  --container-${c.name}: ${c.maxPx}px;\n`;
  }
  css += `  --prose-max: ${proseMaxCh}ch;\n`;

  css += `\n  /* Aspect Ratios */\n`;
  for (const a of ars) {
    css += `  --aspect-${a.name}: ${formatAspect(a)};\n`;
  }

  css += `}\n`;
  return css;
}

/** Tailwind v4 @theme — uses v4-native prefixes where applicable. */
export function generateSpaceTailwind(opts: SpaceExportOptions): string {
  const { spacingTokens, breakpoints, containers, aspectRatios, includeReciprocals, ratioLabel } = opts;

  const bps = sortBreakpoints(breakpoints);
  const cts = sortContainers(containers);
  const ars = expandAspects(aspectRatios, includeReciprocals);

  let css = `/* Space — ${ratioLabel} */\n`;
  css += `/* Tailwind v4: --spacing-*, --breakpoint-*, --container-* are native theme keys. */\n`;
  css += `@theme {\n`;

  for (const t of spacingTokens) {
    css += `  --spacing-${t.name}: ${t.rem}rem;\n`;
  }

  css += `\n`;
  for (const b of bps) {
    css += `  --breakpoint-${b.name}: ${b.minPx}px;\n`;
  }

  css += `\n`;
  for (const c of cts) {
    css += `  --container-${c.name}: ${c.maxPx}px;\n`;
  }

  css += `\n`;
  for (const a of ars) {
    css += `  --aspect-${a.name}: ${formatAspect(a)};\n`;
  }

  css += `}\n`;
  return css;
}

/** LLM Briefing (Markdown) */
export function generateSpaceLlmBriefing(opts: SpaceExportOptions): string {
  const { spacingTokens, breakpoints, fluidMinVw, fluidMaxVw, containers, proseMaxCh, aspectRatios, includeReciprocals, ratioLabel } = opts;

  const bps = sortBreakpoints(breakpoints);
  const cts = sortContainers(containers);
  const ars = expandAspects(aspectRatios, includeReciprocals);

  let md = `# Spacing & Layout — ${ratioLabel}\n\n`;

  md += `## Spacing Scale\n\n`;
  md += `| Token | rem | px |\n`;
  md += `|-------|-----|----|\n`;
  for (const t of spacingTokens) {
    md += `| --space-${t.name} | ${t.rem}rem | ${t.px}px |\n`;
  }

  md += `\n## Breakpoints\n\n`;
  md += `| Name | Min Width |\n`;
  md += `|------|-----------|\n`;
  for (const b of bps) md += `| ${b.name} | ${b.minPx}px |\n`;
  md += `\nFluid viewport anchors: ${fluidMinVw}px (min) → ${fluidMaxVw}px (max).\n`;

  md += `\n## Containers\n\n`;
  md += `| Name | Max Width |\n`;
  md += `|------|-----------|\n`;
  for (const c of cts) md += `| ${c.name} | ${c.maxPx}px |\n`;
  md += `\nProse reading column: ${proseMaxCh}ch.\n`;

  md += `\n## Aspect Ratios\n\n`;
  md += `| Name | Ratio |\n`;
  md += `|------|-------|\n`;
  for (const a of ars) md += `| ${a.name} | ${formatAspect(a)} |\n`;

  md += `\n## Usage\n\n`;
  md += `Use the CSS custom properties from the CSS or Tailwind export.\n`;
  md += `Spacing tokens follow a ${opts.ratioLabel} scale suitable for margins, padding, and gap values.\n`;
  md += `Combine with color tokens from standby.design/color, type tokens from standby.design/type, and shape tokens from standby.design/shape.\n`;

  if (includeReciprocals) {
    md += `\n*Portrait variants (-portrait suffix) are included for non-square ratios.*\n`;
  }

  return md;
}
