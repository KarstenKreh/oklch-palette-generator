/**
 * W3C Design Tokens Community Group (DTCG) format export.
 *
 * Generates JSON combining typography and spacing tokens
 * in the standardized format for Figma, Style Dictionary, etc.
 */

import type { ComputedLevel } from '@core/scale';
import type { SpacingToken } from '@core/spacing';
import { fontFamily } from '@core/fontshare';

interface DesignTokenOptions {
  levels: ComputedLevel[];
  spacingTokens: SpacingToken[];
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  headingWeight: number;
}

export function generateDesignTokens(opts: DesignTokenOptions): string {
  const { levels, spacingTokens, headingFont, bodyFont, monoFont, headingWeight } = opts;

  const headingFF = fontFamily(headingFont);
  const bodyFF = fontFamily(bodyFont);
  const monoFF = fontFamily(monoFont);

  const tokens: Record<string, unknown> = {
    font: {
      heading: { $type: 'fontFamily', $value: headingFF },
      body: { $type: 'fontFamily', $value: bodyFF },
      mono: { $type: 'fontFamily', $value: monoFF },
    },
    typography: {} as Record<string, unknown>,
    spacing: {} as Record<string, unknown>,
  };

  const typo = tokens.typography as Record<string, unknown>;
  for (const l of levels) {
    typo[l.level] = {
      $type: 'typography',
      $value: {
        fontFamily: l.isHeading ? headingFF : bodyFF,
        fontSize: l.clampValue,
        fontWeight: l.isHeading ? headingWeight : 400,
        lineHeight: l.lineHeight,
        letterSpacing: `${l.letterSpacing}em`,
      },
    };
  }

  const space = tokens.spacing as Record<string, unknown>;
  for (const t of spacingTokens) {
    space[t.name] = {
      $type: 'dimension',
      $value: `${t.rem}rem`,
    };
  }

  return JSON.stringify(tokens, null, 2);
}
