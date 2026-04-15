/**
 * Code export generators for the type scale.
 */

import type { ComputedLevel } from '@core/scale';
import { fontFamily, buildFontshareEmbed } from '@core/fontshare';

interface ExportOptions {
  levels: ComputedLevel[];
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  scaleLabel: string;
}

/** CSS Custom Properties */
export function generateCssExport(opts: ExportOptions): string {
  const { levels, headingFont, bodyFont, monoFont, scaleLabel } = opts;

  const headingFF = fontFamily(headingFont);
  const bodyFF = fontFamily(bodyFont);
  const monoFF = fontFamily(monoFont);

  const isGolden = scaleLabel.includes('√φ');
  let css = `/* Type Scale — ${scaleLabel} */\n`;
  if (isGolden) {
    css += `/* Scales the perceived area of letterforms by the golden ratio. */\n`;
  }
  css += `:root {\n`;
  css += `  /* Font Families */\n`;
  css += `  --font-heading: ${headingFF};\n`;
  css += `  --font-body: ${bodyFF};\n`;
  css += `  --font-mono: ${monoFF};\n`;
  css += `\n  /* Type Scale */\n`;

  for (const l of levels) {
    css += `  --text-${l.level}: ${l.clampValue};\n`;
  }

  css += `\n  /* Line Heights */\n`;
  for (const l of levels) {
    css += `  --leading-${l.level}: ${l.lineHeight};\n`;
  }

  css += `\n  /* Letter Spacing */\n`;
  for (const l of levels) {
    css += `  --tracking-${l.level}: ${l.letterSpacing}em;\n`;
  }

  css += `}\n`;
  return css;
}

/** Tailwind v4 @theme */
export function generateTailwindV4Export(opts: ExportOptions): string {
  const { levels, headingFont, bodyFont, monoFont, scaleLabel } = opts;

  const headingFF = fontFamily(headingFont);
  const bodyFF = fontFamily(bodyFont);
  const monoFF = fontFamily(monoFont);

  const isGolden = scaleLabel.includes('√φ');
  let css = `/* Type Scale — ${scaleLabel} */\n`;
  if (isGolden) {
    css += `/* Scales the perceived area of letterforms by the golden ratio. */\n`;
  }
  css += `@theme {\n`;
  css += `  --font-heading: ${headingFF};\n`;
  css += `  --font-body: ${bodyFF};\n`;
  css += `  --font-mono: ${monoFF};\n`;
  css += `\n`;

  for (const l of levels) {
    css += `  --text-${l.level}: ${l.clampValue};\n`;
  }

  css += `\n`;
  for (const l of levels) {
    css += `  --leading-${l.level}: ${l.lineHeight};\n`;
  }

  css += `\n`;
  for (const l of levels) {
    css += `  --tracking-${l.level}: ${l.letterSpacing}em;\n`;
  }

  css += `}\n`;
  return css;
}

/** LLM Briefing (Markdown) */
export function generateLlmBriefing(opts: ExportOptions): string {
  const { levels, headingFont, bodyFont, monoFont, scaleLabel } = opts;

  const headingFF = fontFamily(headingFont);
  const bodyFF = fontFamily(bodyFont);
  const monoFF = fontFamily(monoFont);

  let md = `# Type Scale — ${scaleLabel}\n\n`;

  md += `## Fonts\n\n`;
  md += `- **Heading:** ${headingFF}\n`;
  md += `- **Body:** ${bodyFF}\n`;
  md += `- **Mono:** ${monoFF}\n`;

  md += `\n## Type Scale\n\n`;
  md += `| Level | Min | Max | clamp() |\n`;
  md += `|-------|-----|-----|---------|\n`;
  for (const l of levels) {
    if (l.isFluid) {
      md += `| ${l.label} | ${l.minRem}rem | ${l.maxRem}rem | \`${l.clampValue}\` |\n`;
    } else {
      md += `| ${l.label} | ${l.maxRem}rem | — | ${l.maxRem}rem |\n`;
    }
  }

  md += `\n## Line Heights\n\n`;
  md += `| Level | Value |\n`;
  md += `|-------|-------|\n`;
  for (const l of levels) {
    md += `| ${l.label} | ${l.lineHeight} |\n`;
  }

  md += `\n## Letter Spacing\n\n`;
  md += `| Level | Value |\n`;
  md += `|-------|-------|\n`;
  for (const l of levels) {
    md += `| ${l.label} | ${l.letterSpacing}em |\n`;
  }

  md += `\n## Usage\n\n`;
  md += `Use the CSS custom properties from the CSS or Tailwind export.\n`;
  md += `Font sizes use \`clamp()\` for fluid scaling between 375px and 1920px viewport.\n`;
  md += `Combine with color tokens from standby.design/color, shape tokens from standby.design/shape, and spacing/layout tokens from standby.design/space.\n`;

  return md;
}

/** Fontshare embed snippet */
export function generateFontEmbed(
  headingFont: string,
  bodyFont: string,
  monoFont: string,
): string {
  const slugs = [headingFont, bodyFont, monoFont].filter(Boolean);
  const embed = buildFontshareEmbed(slugs);
  if (!embed) return '<!-- No Fontshare fonts selected -->';
  return `<!-- Fontshare Fonts -->\n${embed}`;
}
