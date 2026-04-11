import { useMemo } from 'react';
import { useTypeStore } from '@/store/type-store';
import { useComputedScale } from './use-computed-scale';
import { computeSpacingTokens, type SpacingToken } from '@core/spacing';

export function useComputedSpacing(): SpacingToken[] {
  const levels = useComputedScale();
  const multiplier = useTypeStore((s) => s.spacingBaseMultiplier);

  return useMemo(
    () => computeSpacingTokens(levels, multiplier),
    [levels, multiplier],
  );
}
