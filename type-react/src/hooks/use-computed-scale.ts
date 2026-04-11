import { useMemo } from 'react';
import { useTypeStore } from '@/store/type-store';
import {
  traditionalScale,
  customScale,
  type ComputedLevel,
} from '@core/scale';
import { applyTypography } from '@core/typography';

export function useComputedScale(): ComputedLevel[] {
  const scaleMode = useTypeStore((s) => s.scaleMode);
  const baseSize = useTypeStore((s) => s.baseSize);
  const mobileBaseSize = useTypeStore((s) => s.mobileBaseSize);
  const customRatio = useTypeStore((s) => s.customRatio);
  const mobileRatioMode = useTypeStore((s) => s.mobileRatioMode);
  const mobileRatio = useTypeStore((s) => s.mobileRatio);
  const autoShrink = useTypeStore((s) => s.autoShrink);
  const traditionalAssignments = useTypeStore((s) => s.traditionalAssignments);
  const traditionalMobileAssignments = useTypeStore((s) => s.traditionalMobileAssignments);
  const lineHeightOverrides = useTypeStore((s) => s.lineHeightOverrides);
  const letterSpacingOverrides = useTypeStore((s) => s.letterSpacingOverrides);

  return useMemo(() => {
    let scale: ComputedLevel[];
    switch (scaleMode) {
      case 'traditional':
        scale = traditionalScale(traditionalAssignments, traditionalMobileAssignments);
        break;
      default: {
        const effectiveMobileRatio =
          mobileRatioMode === 'auto'
            ? 1 + (customRatio - 1) * (1 - autoShrink / 100)
            : mobileRatio;
        scale = customScale(baseSize, customRatio, effectiveMobileRatio, mobileBaseSize);
        break;
      }
    }
    scale = applyTypography(scale, lineHeightOverrides, letterSpacingOverrides);
    return scale;
  }, [scaleMode, baseSize, mobileBaseSize, customRatio, mobileRatioMode, mobileRatio, autoShrink, traditionalAssignments, traditionalMobileAssignments, lineHeightOverrides, letterSpacingOverrides]);
}
