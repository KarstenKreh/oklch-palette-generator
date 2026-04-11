/**
 * Icon sizing token generation.
 * Derives a 5-level size scale from base size and scale factor.
 */

export interface IconSizeToken {
  name: string;
  rem: number;
  px: number;
  useCase: string;
}

export interface IconTokens {
  sizes: IconSizeToken[];
  strokeWidth: number;
}

/**
 * Generate icon sizing tokens.
 * @param baseSize - The md (default) icon size in rem
 * @param scale - Multiplier between adjacent steps
 * @param strokePx - Stroke width in px (derived from selected set's weight)
 */
/**
 * @param snapTo4px - If true, round each size to the nearest 4px grid
 */
export function computeIconTokens(baseSize: number, scale: number, strokePx: number, snapTo4px = true): IconTokens {
  const md = baseSize;
  const sm = md / scale;
  const xs = sm / scale;
  const lg = md * scale;
  const xl = lg * scale;
  const xxl = xl * scale;

  const toToken = (raw: number, name: string, useCase: string): IconSizeToken => {
    const px = snapTo4px ? Math.round((raw * 16) / 4) * 4 : Math.round(raw * 16);
    const rem = snapTo4px ? px / 16 : Math.round(raw * 10000) / 10000;
    return { name, rem, px, useCase };
  };

  return {
    sizes: [
      toToken(xs, 'xs', 'Inline, caption-level'),
      toToken(sm, 'sm', 'Body text companion'),
      toToken(md, 'md', 'Standard UI elements'),
      toToken(lg, 'lg', 'Navigation, actions'),
      toToken(xl, 'xl', 'Feature, hero sections'),
      toToken(xxl, '2xl', 'Display, illustration'),
    ],
    strokeWidth: strokePx,
  };
}

/** Map icon set weight to stroke width in px. */
export function weightToStroke(weight: 'thin' | 'regular' | 'bold'): number {
  switch (weight) {
    case 'thin': return 1;
    case 'regular': return 1.5;
    case 'bold': return 2;
  }
}
