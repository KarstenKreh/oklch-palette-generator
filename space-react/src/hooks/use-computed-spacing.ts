import { useMemo } from 'react';
import { useSpaceStore } from '@/store/space-store';
import { computeSpacingTokens, type SpacingToken } from '@core/spacing';

export function useComputedSpacing(): SpacingToken[] {
  const mode = useSpaceStore((s) => s.spacingMode);
  const baseRem = useSpaceStore((s) => s.spacingBaseRem);
  const ratio = useSpaceStore((s) => s.spacingRatio);
  const multiplier = useSpaceStore((s) => s.spacingMultiplier);
  const snap = useSpaceStore((s) => s.spacingSnap);

  return useMemo(
    () => computeSpacingTokens({ mode, baseRem, ratio, multiplier, snap }),
    [mode, baseRem, ratio, multiplier, snap],
  );
}
