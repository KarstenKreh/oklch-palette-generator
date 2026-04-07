import { useMemo } from 'react';
import { useShapeStore } from '@/store/shape-store';
import { generateShadows, type ShadowConfig } from '@/lib/shadows';
import { hexToOklch, oklchToHex } from '@/lib/color-math';

/** Derive a set of surface colors from a single hex for preview. */
function deriveSurface(hex: string, isDark: boolean) {
  const [, , H] = hexToOklch(hex);
  const C = 0.015;
  if (isDark) {
    return {
      bg: oklchToHex(0.15, C, H),
      card: oklchToHex(0.20, C, H),
      elevated: oklchToHex(0.24, C, H),
      muted: oklchToHex(0.18, C, H),
      border: oklchToHex(0.28, C * 0.8, H),
      borderMuted: oklchToHex(0.24, C * 0.5, H),
      text: oklchToHex(0.92, C * 0.3, H),
      textMuted: oklchToHex(0.65, C * 0.3, H),
      primary: hex,
      primaryFg: oklchToHex(0.98, 0, H),
    };
  }
  return {
    bg: oklchToHex(0.96, C * 0.3, H),
    card: oklchToHex(0.99, C * 0.1, H),
    elevated: oklchToHex(1.0, 0, H),
    muted: oklchToHex(0.94, C * 0.4, H),
    border: oklchToHex(0.85, C * 0.6, H),
    borderMuted: oklchToHex(0.90, C * 0.3, H),
    text: oklchToHex(0.15, C * 0.3, H),
    textMuted: oklchToHex(0.45, C * 0.3, H),
    primary: hex,
    primaryFg: oklchToHex(0.98, 0, H),
  };
}

function PreviewPanel({ isDark }: { isDark: boolean }) {
  const store = useShapeStore();
  const colors = useMemo(() => deriveSurface(store.surfaceHex, isDark), [store.surfaceHex, isDark]);

  const shadowConfig: ShadowConfig = {
    type: store.shadowType,
    strength: store.shadowStrength,
    blurScale: store.shadowBlurScale,
    scale: store.shadowScale,
    colorMode: store.shadowColorMode,
    customColor: store.shadowCustomColor,
  };

  const shadows = useMemo(
    () => store.shadowEnabled ? generateShadows(colors.bg, isDark, shadowConfig) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colors.bg, isDark, store.shadowEnabled, store.shadowType, store.shadowStrength, store.shadowBlurScale, store.shadowScale, store.shadowColorMode, store.shadowCustomColor],
  );

  const radius = store.borderRadius;
  const borderShadow = store.borderEnabled ? `inset 0 0 0 ${store.borderWidth}px ${colors.border}` : '';
  const ringColor = store.ringColorMode === 'custom' ? store.ringCustomColor : colors.primary;

  return (
    <div
      className="relative rounded-lg p-4 space-y-4 flex-1 min-w-0 overflow-hidden"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {/* Background circle for glass/transparency visibility */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '0%',
          left: '50%',
          width: '120%',
          height: '120%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${colors.primary}20, ${colors.primary}08)`,
        }}
      />
      <div className="relative flex items-center gap-2">
        <span className="text-caption font-semibold" style={{ color: colors.textMuted }}>
          {isDark ? 'Dark' : 'Light'}
        </span>
      </div>

      {/* Elevation Cards */}
      <div className="relative space-y-2">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((level) => {
          const shadow = shadows.find(s => s.name === level);
          const radiusScale: Record<string, number> = {
            xs: Math.round(radius / 4),
            sm: Math.round(radius / 2),
            md: radius,
            lg: Math.round(radius * 1.5),
            xl: Math.round(radius * 2),
          };
          const levelRadius = radiusScale[level];
          return (
            <div
              key={level}
              className="px-3 py-2 flex items-center justify-between"
              style={{
                backgroundColor: colors.card,
                boxShadow: [shadow?.shadow, borderShadow].filter(Boolean).join(', ') || undefined,
                borderRadius: `${levelRadius}px`,
              }}
            >
              <span className="text-caption font-semibold">{level}</span>
              <span className="text-[9px] font-mono truncate ml-2 max-w-[60%] text-right" style={{ color: colors.textMuted }}>
                {shadow ? (shadow.shadow.length > 60 ? shadow.shadow.slice(0, 57) + '…' : shadow.shadow) : 'none'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="relative flex items-center gap-2">
        <button
          className="px-3 py-1.5 text-caption font-medium"
          style={{
            backgroundColor: colors.primary,
            color: colors.primaryFg,
            borderRadius: `${radius}px`,
            boxShadow: shadows.find(s => s.name === 'sm')?.shadow,
          }}
        >
          Primary
        </button>
        <button
          className="px-3 py-1.5 text-caption font-medium"
          style={{
            backgroundColor: colors.muted,
            color: colors.text,
            borderRadius: `${radius}px`,
            boxShadow: borderShadow || undefined,
          }}
        >
          Secondary
        </button>
      </div>

      {/* Input with focus ring */}
      <div className="relative">
        <div
          className="px-3 py-1.5 text-caption"
          style={{
            backgroundColor: colors.card,
            borderRadius: `${radius}px`,
            boxShadow: borderShadow || undefined,
            outline: `${store.ringWidth}px solid ${ringColor}`,
            outlineOffset: `${store.ringOffset}px`,
            color: colors.textMuted,
          }}
        >
          Input with focus ring
        </div>
      </div>

    </div>
  );
}

export function ShapePreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <PreviewPanel isDark={false} />
      <PreviewPanel isDark={true} />
    </div>
  );
}
