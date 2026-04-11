import { useMemo } from 'react';
import { Vaso } from 'vaso';
import { useShapeStore } from '@/store/shape-store';
import { generateShadows, type ShadowConfig } from '@core/shadows';
import { generatePalette, computeAutoErrorHex, type PaletteEntry, type Step, type PaletteMode } from '@core/palette';
import { contrastRatio } from '@core/color-math';

/** Look up a step in a palette by step number. */
function step(palette: PaletteEntry[], s: Step): string {
  return palette.find(e => e.step === s)!.hex;
}

/** Pick foreground from palette — decide direction via #FFF/#1A1A1A (matches Color app), return palette step. */
function pickFgFromPalette(bgHex: string, palette: PaletteEntry[], lightStep: Step, darkStep: Step): string {
  const crWhite = contrastRatio('#FFFFFF', bgHex);
  const crDark = contrastRatio('#1A1A1A', bgHex);
  return crWhite >= crDark ? step(palette, lightStep) : step(palette, darkStep);
}

/** Derive semantic preview colors from brand hex using the real palette engine. */
function deriveSurface(hex: string, isDark: boolean, mode: PaletteMode = 'balanced', chromaScale: number = 1.0, brandPin: boolean = false) {
  const brand = generatePalette(hex, 1.0, mode);
  const surface = generatePalette(hex, chromaScale * 0.15, mode);
  const errorHex = computeAutoErrorHex(hex);
  const error = generatePalette(errorHex, 1.0, mode);
  const errorSurface = generatePalette(errorHex, 0.1, mode);  // neutral version for fg

  if (isDark) {
    const primaryBg = brandPin ? hex : step(brand, 400);
    const secondaryBg = step(brand, 800);
    const destructiveBg = step(error, 400);
    return {
      bg: step(surface, 875),
      card: step(surface, 825),
      elevated: step(surface, 800),
      muted: step(surface, 850),
      secondary: secondaryBg,
      secondaryFg: pickFgFromPalette(secondaryBg, brand, 100, 900),
      destructive: destructiveBg,
      destructiveFg: pickFgFromPalette(destructiveBg, errorSurface, 100, 900),
      border: step(surface, 600),
      borderMuted: step(surface, 700),
      text: step(surface, 25),
      textMuted: step(surface, 300),
      primary: primaryBg,
      primaryFg: pickFgFromPalette(primaryBg, brand, 50, 975),
      ring: step(surface, 500),
    };
  }

  const primaryBg = brandPin ? hex : step(brand, 600);
  const secondaryBg = step(brand, 200);
  const destructiveBg = step(error, 600);
  return {
    bg: step(surface, 50),
    card: step(surface, 25),
    elevated: step(surface, 25),
    muted: step(surface, 75),
    secondary: secondaryBg,
    secondaryFg: pickFgFromPalette(secondaryBg, brand, 100, 900),
    destructive: destructiveBg,
    destructiveFg: pickFgFromPalette(destructiveBg, errorSurface, 100, 900),
    border: step(surface, 300),
    borderMuted: step(surface, 200),
    text: step(surface, 975),
    textMuted: step(surface, 700),
    primary: primaryBg,
    primaryFg: pickFgFromPalette(primaryBg, brand, 50, 975),
    ring: step(surface, 400),
  };
}

/* ------------------------------------------------------------------ */
/*  Unified Preview Panel                                              */
/* ------------------------------------------------------------------ */

function PreviewPanel({ isDark }: { isDark: boolean }) {
  const store = useShapeStore();
  const colors = useMemo(() => deriveSurface(store.surfaceHex, isDark, store.paletteMode, store.chromaScale, store.brandPin), [store.surfaceHex, isDark, store.paletteMode, store.chromaScale, store.brandPin]);
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
              <div key={level} className="overflow-hidden" style={{ borderRadius: `${levelRadius}px` }}>
                <Vaso
                  className="w-full"
                  px={0}
                  py={0}
                  radius={levelRadius}
                  depth={store.glassDepth}
                  blur={store.glassBlur}
                  dispersion={store.glassDispersion}
                >
                  <div className="relative z-10 px-3 py-2 flex items-center justify-between">
                    <span className="text-caption font-semibold">{level}</span>
                    <span className="text-[9px] font-mono" style={{ color: colors.textMuted }}>
                      depth {store.glassDepth.toFixed(1)}
                    </span>
                  </div>
                </Vaso>
              </div>
            );
          }

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
        {isGlass ? (
          <>
            <button
              className="px-3 py-1.5 text-caption font-medium"
              style={{
                backgroundColor: colors.primary,
                color: colors.primaryFg,
                borderRadius: `${radius}px`,
              }}
            >
              Primary
            </button>
            <div className="overflow-hidden" style={{ borderRadius: `${radius}px` }}>
              <Vaso px={0} py={0} radius={radius} depth={store.glassDepth * 0.5} blur={store.glassBlur * 0.7} dispersion={store.glassDispersion * 0.5}>
                <span className="relative z-10 text-caption font-medium px-3 py-1.5 block" style={{ color: colors.text }}>
                  Secondary
                </span>
              </Vaso>
            </div>
            <button
              className="px-3 py-1.5 text-caption font-medium"
              style={{
                backgroundColor: colors.destructive,
                color: colors.destructiveFg,
                borderRadius: `${radius}px`,
              }}
            >
              Destructive
            </button>
          </>
        ) : (
          <>
            <button
              className="px-3 py-1.5 text-caption font-medium"
              style={{
                backgroundColor: colors.primary,
                color: colors.primaryFg,
                borderRadius: `${radius}px`,
              }}
            >
              Primary
            </button>
            <button
              className="px-3 py-1.5 text-caption font-medium"
              style={{
                backgroundColor: colors.secondary,
                color: colors.secondaryFg,
                borderRadius: `${radius}px`,
              }}
            >
              Secondary
            </button>
            <button
              className="px-3 py-1.5 text-caption font-medium"
              style={{
                backgroundColor: colors.destructive,
                color: colors.destructiveFg,
                borderRadius: `${radius}px`,
              }}
            >
              Destructive
            </button>
          </>
        )}
      </div>

      {/* Input with focus ring */}
      <div className="relative">
        {isGlass ? (
          <div
            style={{
              outline: `${store.ringWidth}px solid ${ringColor}`,
              outlineOffset: `${store.ringOffset}px`,
              borderRadius: `${radius}px`,
              overflow: 'hidden',
            }}
          >
            <Vaso
              className="w-full"
              px={0}
              py={0}
              radius={radius}
              depth={store.glassDepth * 0.3}
              blur={store.glassBlur}
              dispersion={store.glassDispersion * 0.3}
            >
              <div
                className="relative z-10 px-3 py-1.5 text-caption"
                style={{ color: colors.textMuted }}
              >
                Input with focus ring
              </div>
            </Vaso>
          </div>
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
