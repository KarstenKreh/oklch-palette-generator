import { useMemo } from 'react';
import { TriangleAlert } from 'lucide-react';
import { useShapeStore } from '@/store/shape-store';
import { generateShadows, generateNeumorphicInset, type ShadowConfig } from '@core/shadows';
import { deriveSurface } from '@core/surface';
import { contrastRatio } from '@core/color-math';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { LiquidGlass } from '@core/liquid-glass';

/** Dynamic contrast warning — renders a small alert icon with tooltip when ratio < WCAG AA (4.5). */
function ContrastWarning({ fg, bg, label }: { fg: string; bg: string; label: string }) {
  const ratio = contrastRatio(fg, bg);
  if (ratio >= 4.5) return null;
  return (
    <Tooltip>
      <TooltipTrigger>
        <TriangleAlert className="size-3 text-amber-500 shrink-0" aria-label={`Kontrast-Warnung: ${label}`} />
      </TooltipTrigger>
      <TooltipContent>
        Kontrast {ratio.toFixed(2)}:1 — unter WCAG AA (4.5:1) für {label}.
      </TooltipContent>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ */
/*  Unified Preview Panel                                              */
/* ------------------------------------------------------------------ */

function PreviewPanel({ isDark }: { isDark: boolean }) {
  const store = useShapeStore();
  const colors = useMemo(() => deriveSurface(store.surfaceHex, isDark, store.paletteMode, store.chromaScale, store.brandPin, store.shapeStyle), [store.surfaceHex, isDark, store.paletteMode, store.chromaScale, store.brandPin, store.shapeStyle]);
  const isGlass = store.shapeStyle === 'glass';
  const isNeomorph = store.shapeStyle === 'neomorph';

  const shadowConfig: ShadowConfig = {
    type: isNeomorph ? 'neumorphic' : store.shadowType,
    strength: store.shadowStrength,
    blurScale: store.shadowBlurScale,
    scale: store.shadowScale,
    colorMode: store.shadowColorMode,
    customColor: store.shadowCustomColor,
  };

  const shadows = useMemo(
    () => store.shadowEnabled ? generateShadows(colors.bg, isDark, shadowConfig) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colors.bg, isDark, store.shadowEnabled, store.shadowType, store.shapeStyle, store.shadowStrength, store.shadowBlurScale, store.shadowScale, store.shadowColorMode, store.shadowCustomColor],
  );

  const insetShadows = useMemo(
    () => isNeomorph && store.shadowEnabled ? generateNeumorphicInset(colors.bg, isDark, shadowConfig) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isNeomorph, colors.bg, isDark, store.shadowEnabled, store.shapeStyle, store.shadowStrength, store.shadowBlurScale, store.shadowScale],
  );

  const radius = store.borderRadius;
  const borderShadow = store.borderEnabled ? `inset 0 0 0 ${store.borderWidth}px ${colors.border}` : '';
  const ringColor = store.ringColorMode === 'custom' ? store.ringCustomColor : colors.primary;

  return (
    <div
      className="relative rounded-lg p-4 space-y-4 flex-1 min-w-0 overflow-hidden"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {/* Decorative background — aspect-ratio: 1 keeps circle round */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%',
          right: '-20%',
          width: '80%',
          aspectRatio: '1',
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${colors.primary}${isGlass ? '35' : '20'}, ${colors.primary}${isGlass ? '12' : '08'})`,
        }}
      />
      {isGlass && (
        <div className="absolute pointer-events-none" style={{
          top: '8%', left: '8%', width: 70, height: 70, borderRadius: '50%',
          background: `linear-gradient(135deg, ${colors.primary}60, ${colors.primary}15)`,
        }} />
      )}

      {/* Mode label */}
      <div className="relative flex items-center gap-2">
        <span className="text-caption font-semibold" style={{ color: colors.textMuted }}>
          {isDark ? 'Dark' : 'Light'}
        </span>
      </div>

      {/* Elevation Cards */}
      <div className="relative flex gap-4">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((level) => {
          const radiusMap: Record<string, number> = {
            xs: Math.round(radius / 4),
            sm: Math.round(radius / 2),
            md: radius,
            lg: Math.round(radius * 1.5),
            xl: Math.round(radius * 2),
          };
          const levelRadius = radiusMap[level];
          const shadow = shadows.find(s => s.name === level);

          if (isGlass) {
            return (
              <LiquidGlass
                key={level}
                depth={store.glassDepth}
                blur={store.glassBlur}
                dispersion={store.glassDispersion}
                cornerRadius={levelRadius}
                onDark={isDark}
                className="flex-1"
              >
                <div className="p-2 flex flex-col items-center gap-1">
                  <span className="text-caption font-semibold">{level}</span>
                  <span className="text-[9px] font-mono" style={{ color: colors.textMuted }}>
                    {levelRadius}px
                  </span>
                </div>
              </LiquidGlass>
            );
          }

          return (
            <div
              key={level}
              className="flex-1 p-2 flex flex-col items-center gap-1"
              style={{
                backgroundColor: colors.card,
                boxShadow: [shadow?.shadow, borderShadow].filter(Boolean).join(', ') || undefined,
                borderRadius: `${levelRadius}px`,
                ...(store.borderEnabled && { border: `${store.borderWidth}px solid ${colors.borderMuted}` }),
              }}
            >
              <span className="text-caption font-semibold">{level}</span>
              <span className="text-[9px] font-mono" style={{ color: colors.textMuted }}>
                {levelRadius}px
              </span>
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="relative flex items-center gap-2">
        {([
          { label: 'Primary', bg: colors.primary, fg: colors.primaryFg },
          { label: 'Secondary', bg: colors.secondary, fg: colors.secondaryFg },
          { label: 'Destructive', bg: colors.destructive, fg: colors.destructiveFg },
        ] as const).map(({ label, bg, fg }) => {
          const buttonShadow = isNeomorph ? shadows.find(s => s.name === 'sm')?.shadow : undefined;
          return (
            <div key={label} className="relative inline-flex items-center">
              <button
                className="px-3 py-1.5 text-caption font-medium inline-flex items-center gap-1.5"
                style={{ backgroundColor: bg, color: fg, borderRadius: `${radius}px`, boxShadow: buttonShadow }}
              >
                {label}
                <ContrastWarning fg={fg} bg={bg} label={`${label}-Button`} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Input with focus ring */}
      <div className="relative">
        {isGlass ? (
          <LiquidGlass
            depth={store.glassDepth * 0.3}
            blur={store.glassBlur}
            dispersion={store.glassDispersion * 0.3}
            cornerRadius={radius}
            onDark={isDark}
            style={{
              outline: `${store.ringWidth}px solid ${ringColor}`,
              outlineOffset: `${store.ringOffset}px`,
            }}
          >
            <div
              className="px-3 py-1.5 text-caption"
              style={{ color: colors.textMuted }}
            >
              Input with focus ring
            </div>
          </LiquidGlass>
        ) : (
          <div
            className="px-3 py-1.5 text-caption"
            style={{
              backgroundColor: colors.card,
              borderRadius: `${radius}px`,
              boxShadow: [
                isNeomorph ? insetShadows.find(s => s.name === 'sm')?.shadow : null,
                borderShadow,
              ].filter(Boolean).join(', ') || undefined,
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
