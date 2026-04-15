/**
 * W3C Design Tokens Community Group (DTCG) JSON export.
 * Aspect ratios emit as $type: "string" (no DTCG primitive for ratios in v1).
 */

import type { SpacingToken } from '@core/spacing';
import type { Breakpoint, Container } from '@core/layout';
import type { AspectRatio } from '@core/aspect';
import { formatAspect, reciprocal } from '@core/aspect';
import { sortBreakpoints, sortContainers } from '@core/layout';

interface DesignTokenOptions {
  spacingTokens: SpacingToken[];
  breakpoints: Breakpoint[];
  fluidMinVw: number;
  fluidMaxVw: number;
  containers: Container[];
  proseMaxCh: number;
  aspectRatios: AspectRatio[];
  includeReciprocals: boolean;
}

export function generateDesignTokens(opts: DesignTokenOptions): string {
  const { spacingTokens, breakpoints, fluidMinVw, fluidMaxVw, containers, proseMaxCh, aspectRatios, includeReciprocals } = opts;

  const spacing: Record<string, unknown> = {};
  for (const t of spacingTokens) {
    spacing[t.name] = { $type: 'dimension', $value: `${t.rem}rem` };
  }

  const breakpoint: Record<string, unknown> = {};
  for (const b of sortBreakpoints(breakpoints)) {
    breakpoint[b.name] = { $type: 'dimension', $value: `${b.minPx}px` };
  }
  breakpoint['fluid-min'] = { $type: 'dimension', $value: `${fluidMinVw}px` };
  breakpoint['fluid-max'] = { $type: 'dimension', $value: `${fluidMaxVw}px` };

  const container: Record<string, unknown> = {};
  for (const c of sortContainers(containers)) {
    container[c.name] = { $type: 'dimension', $value: `${c.maxPx}px` };
  }
  container['prose-max'] = { $type: 'dimension', $value: `${proseMaxCh}ch` };

  const ars = includeReciprocals
    ? aspectRatios.flatMap((a) => (a.w === a.h ? [a] : [a, reciprocal(a)]))
    : aspectRatios;

  const aspect: Record<string, unknown> = {};
  for (const a of ars) {
    aspect[a.name] = { $type: 'string', $value: formatAspect(a) };
  }

  return JSON.stringify({ spacing, breakpoint, container, aspect }, null, 2);
}
