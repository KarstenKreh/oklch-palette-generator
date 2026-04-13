import { useMemo } from 'react';
import LiquidGlass from 'liquid-glass-react';
import { TriangleAlert } from 'lucide-react';
import { useShapeStore } from '@/store/shape-store';
import { generateShadows, type ShadowConfig } from '@core/shadows';
import { generatePalette, computeAutoErrorHex, type PaletteEntry, type Step, type PaletteMode } from '@core/palette';
import { contrastRatio } from '@core/color-math';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { ShapeStyle } from '@/store/shape-store';

function glassProps(depth: number, blur: number, dispersion: number, cornerRadius: number) {
  return {
    displacementScale: depth * 40,
    blurAmount: blur * 0.03,
    aberrationIntensity: dispersion * 4,
    elasticity: 0,
    cornerRadius,
  };
}

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
function deriveSurface(hex: string, isDark: boolean, mode: PaletteMode = 'balanced', chromaScale: number = 1.0, brandPin: boolean = false, style: ShapeStyle = 'paper') {
  const brand = generatePalette(hex, 1.0, mode);
  const surface = generatePalette(hex, chromaScale * 0.15, mode);
  const errorHex = computeAutoErrorHex(hex);
  const error = generatePalette(errorHex, 1.0, mode);
  const errorSurface = generatePalette(errorHex, 0.1, mode);  // neutral version for fg
  const isNeomorph = style === 'neomorph';

  if (isDark) {
    const primaryBg = brandPin ? hex : step(brand, 400);
    const secondaryBg = step(brand, 800);
    const destructiveBg = step(error, 400);
    // Neomorph: homogenize bg/card/elevated/muted so surfaces blend into parent — dual shadows carry the depth.
    const monoBg = step(surface, 875);
    return {
      bg: monoBg,
      card: isNeomorph ? monoBg : step(surface, 825),
      elevated: isNeomorph ? monoBg : step(surface, 800),
      muted: isNeomorph ? monoBg : step(surface, 850),
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
  const monoBg = step(surface, 75);
  return {
    bg: isNeomorph ? monoBg : step(surface, 50),
    card: isNeomorph ? monoBg : step(surface, 25),
    elevated: isNeomorph ? monoBg : step(surface, 25),
    muted: isNeomorph ? monoBg : step(surface, 75),
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
      <div className="relative flex gap-2">
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
              <div
                key={level}
                className="flex-1 relative overflow-hidden"
                style={{
                  height: 64,
                  borderRadius: `${levelRadius}px`,
                  boxShadow: `inset 0 0 0 1px ${colors.borderMuted}`,
                }}
              >
                {/* Refraction backdrop — colored stripes give LiquidGlass something to distort */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      linear-gradient(135deg,
                        ${colors.primary}55 0%,
                        ${colors.primary}15 35%,
                        ${colors.secondary}30 65%,
                        ${colors.primary}45 100%)
                    `,
                  }}
                />
                <LiquidGlass {...glassProps(store.glassDepth, store.glassBlur, store.glassDispersion, levelRadius)}>
                  <div className="p-2 flex flex-col items-center gap-1">
                    <span className="text-caption font-semibold">{level}</span>
                    <span className="text-[9px] font-mono" style={{ color: colors.textMuted }}>
                      {levelRadius}px
                    </span>
                  </div>
                </LiquidGlass>
              </div>
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
        ] as const).map(({ label, bg, fg }) => (
          <div key={label} className="relative inline-flex items-center">
            <button
              className="px-3 py-1.5 text-caption font-medium inline-flex items-center gap-1.5"
              style={{ backgroundColor: bg, color: fg, borderRadius: `${radius}px` }}
            >
              {label}
              <ContrastWarning fg={fg} bg={bg} label={`${label}-Button`} />
            </button>
          </div>
        ))}
      </div>

      {/* Input with focus ring */}
      <div className="relative">
        {isGlass ? (
          <div
            className="relative"
            style={{
              height: 32,
              outline: `${store.ringWidth}px solid ${ringColor}`,
              outlineOffset: `${store.ringOffset}px`,
              borderRadius: `${radius}px`,
              overflow: 'hidden',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  linear-gradient(90deg,
                    ${colors.primary}40 0%,
                    ${colors.secondary}30 50%,
                    ${colors.primary}40 100%)
                `,
              }}
            />
            <LiquidGlass {...glassProps(store.glassDepth * 0.3, store.glassBlur, store.glassDispersion * 0.3, radius)}>
              <div
                className="px-3 py-1.5 text-caption"
                style={{ color: colors.textMuted }}
              >
                Input with focus ring
              </div>
            </LiquidGlass>
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
