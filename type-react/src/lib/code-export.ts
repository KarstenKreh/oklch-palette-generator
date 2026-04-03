/**
 * Code export generators for the type scale.
 */

import type { ComputedLevel } from './scale';
import type { SpacingToken } from './spacing';
import { fontFamily, buildFontshareEmbed } from './fontshare';

interface ExportOptions {
  levels: ComputedLevel[];
  spacingTokens: SpacingToken[];
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

  if (opts.spacingTokens.length > 0) {
    css += `\n  /* Spacing Scale */\n`;
    for (const t of opts.spacingTokens) {
      css += `  --space-${t.name}: ${t.rem}rem;\n`;
    }
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

  if (opts.spacingTokens.length > 0) {
    css += `\n`;
    for (const t of opts.spacingTokens) {
      css += `  --space-${t.name}: ${t.rem}rem;\n`;
    }
  }

  css += `}\n`;
  return css;
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
