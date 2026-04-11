import { useMemo } from 'react';
import { Vaso } from 'vaso';
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

/* ------------------------------------------------------------------ */
/*  Unified Preview Panel                                              */
/* ------------------------------------------------------------------ */

function PreviewPanel({ isDark }: { isDark: boolean }) {
  const store = useShapeStore();
  const colors = useMemo(() => deriveSurface(store.surfaceHex, isDark), [store.surfaceHex, isDark]);
  const isGlass = store.shapeStyle === 'glass';

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

  /** Wrap children in Vaso (glass) or a plain div (paper) */
  function CardSurface({ level, children }: { level: string; children: React.ReactNode }) {
    const radiusMap: Record<string, number> = {
      xs: Math.round(radius / 4),
      sm: Math.round(radius / 2),
      md: radius,
      lg: Math.round(radius * 1.5),
      xl: Math.round(radius * 2),
    };
    const levelRadius = radiusMap[level] ?? radius;
    const shadow = shadows.find(s => s.name === level);

    if (isGlass) {
      return (
        <Vaso
          px={12}
          py={8}
          radius={levelRadius}
          depth={store.glassDepth}
          blur={store.glassBlur}
          dispersion={store.glassDispersion}
        >
          {children}
        </Vaso>
      );
    }

    return (
      <div
        style={{
          backgroundColor: colors.card,
          boxShadow: [shadow?.shadow, borderShadow].filter(Boolean).join(', ') || undefined,
          borderRadius: `${levelRadius}px`,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className="relative rounded-lg p-4 space-y-4 flex-1 min-w-0 overflow-hidden"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {/* Decorative background */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '0%',
          left: '50%',
          width: '120%',
          height: '120%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${colors.primary}${isGlass ? '35' : '20'}, ${colors.primary}${isGlass ? '12' : '08'})`,
        }}
      />
      {isGlass && (
        <>
          <div className="absolute pointer-events-none" style={{
            top: '8%', left: '8%', width: 70, height: 70, borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.primary}60, ${colors.primary}15)`,
          }} />
          <div className="absolute pointer-events-none" style={{
            bottom: '12%', right: '12%', width: 45, height: 45, borderRadius: '8px',
            background: `linear-gradient(45deg, ${colors.primary}40, ${colors.primary}10)`,
            transform: 'rotate(25deg)',
          }} />
          <div className="absolute pointer-events-none" style={{
            top: '40%', right: '25%', width: 25, height: 55, borderRadius: '12px',
            background: `linear-gradient(180deg, ${colors.primary}30, transparent)`,
          }} />
        </>
      )}

      {/* Mode label */}
      <div className="relative flex items-center gap-2">
        <span className="text-caption font-semibold" style={{ color: colors.textMuted }}>
          {isDark ? 'Dark' : 'Light'}
        </span>
      </div>

      {/* Elevation Cards */}
      <div className="relative space-y-2">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((level) => {
          const shadow = shadows.find(s => s.name === level);
          return (
            <CardSurface key={level} level={level}>
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-caption font-semibold">{level}</span>
                <span className="text-[9px] font-mono truncate ml-2 max-w-[60%] text-right" style={{ color: colors.textMuted }}>
                  {isGlass
                    ? `depth ${store.glassDepth.toFixed(1)}`
                    : shadow ? (shadow.shadow.length > 60 ? shadow.shadow.slice(0, 57) + '…' : shadow.shadow) : 'none'
                  }
                </span>
              </div>
            </CardSurface>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="relative flex items-center gap-2">
        {isGlass ? (
          <>
            <Vaso px={8} py={4} radius={radius} depth={store.glassDepth} blur={store.glassBlur} dispersion={store.glassDispersion}>
              <span className="text-caption font-medium px-3 py-1.5 block" style={{ color: colors.text }}>
                Primary
              </span>
            </Vaso>
            <Vaso px={8} py={4} radius={radius} depth={store.glassDepth * 0.5} blur={store.glassBlur * 0.7} dispersion={store.glassDispersion * 0.5}>
              <span className="text-caption font-medium px-3 py-1.5 block" style={{ color: colors.textMuted }}>
                Secondary
              </span>
            </Vaso>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Input with focus ring */}
      <div className="relative">
        {isGlass ? (
          <Vaso px={10} py={6} radius={radius} depth={store.glassDepth * 0.3} blur={store.glassBlur} dispersion={store.glassDispersion * 0.3}>
            <div
              className="px-3 py-1.5 text-caption"
              style={{
                color: colors.textMuted,
                outline: `${store.ringWidth}px solid ${ringColor}`,
                outlineOffset: `${store.ringOffset}px`,
                borderRadius: `${radius}px`,
              }}
            >
              Input with focus ring
            </div>
          </Vaso>
        ) : (
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
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Composite                                                          */
/* ------------------------------------------------------------------ */

export function ShapePreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <PreviewPanel isDark={false} />
      <PreviewPanel isDark={true} />
    </div>
  );
}
