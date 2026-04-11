import type { PaletteEntry } from '@core/palette';
import type { AccentPalette } from '@/hooks/use-palette';
import type { FgContrastMode } from '@/store/theme-store';
import { contrastRatio, invertHex } from '@core/color-math';
import { generateShadowValues } from '@core/shadows';
import { PanelSvg } from '@/components/panel-svg';
import { Sun, Moon, SunDim, MoonStar } from 'lucide-react';

export interface SurfacePanelProps {
  panelType: 'light' | 'dark' | 'light-hc' | 'dark-hc';
  palette: Record<number, PaletteEntry>;
  neutral: Record<number, PaletteEntry>;
  brand: Record<number, PaletteEntry>;
  error: Record<number, PaletteEntry>;
  errorSurface: Record<number, PaletteEntry>;
  brandSwatchOverride: { hex: string; L: number } | null;
  brandInvert: boolean;
  errorSwatchOverride: { hex: string; L: number } | null;
  errorInvert: boolean;
  accentPalettes: AccentPalette[];
  fgContrastMode: FgContrastMode;
  shapeTokens?: { borderEnabled: boolean; borderWidth: number; borderRadius: number };
}

const DARK_FG = '#1A1A1A';
const LIGHT_FG = '#FFFFFF';

function chooseFg(
  bgHex: string,
  mode: FgContrastMode,
): string {
  const crWhite = contrastRatio(bgHex, LIGHT_FG);
  const crDark = contrastRatio(bgHex, DARK_FG);

  switch (mode) {
    case 'best':
      return crWhite >= crDark ? LIGHT_FG : DARK_FG;
    case 'preferLight':
      if (crWhite >= 4.5) return LIGHT_FG;       // preferred passes → use it
      if (crDark >= 4.5) return DARK_FG;          // only other passes → use other
      return LIGHT_FG;                             // neither passes → honor preference
    case 'preferDark':
      if (crDark >= 4.5) return DARK_FG;          // preferred passes → use it
      if (crWhite >= 4.5) return LIGHT_FG;        // only other passes → use other
      return DARK_FG;                              // neither passes → honor preference
  }
}

interface PanelConfig {
  label: string;
  bgHex: string;
  textHex: string;
  isDark: boolean;
  cardHex: string;
  elevatedHex: string;
  activeHex: string;
  mutedHex: string;
  mutedFgHex: string;
  borderHex: string;
  borderMutedHex: string;
}

function getHex(map: Record<number, PaletteEntry>, step: number): string {
  return map[step]?.hex ?? '#888888';
}

function getPanelConfig(
  panelType: SurfacePanelProps['panelType'],
  palette: Record<number, PaletteEntry>,
  neutral: Record<number, PaletteEntry>,
): PanelConfig {
  switch (panelType) {
    case 'light':
      return {
        label: 'Light',
        bgHex: getHex(palette, 75),
        textHex: getHex(palette, 850),
        isDark: false,
        cardHex: getHex(palette, 25),
        elevatedHex: getHex(palette, 50),
        activeHex: getHex(palette, 75),
        mutedHex: getHex(palette, 200),
        mutedFgHex: getHex(palette, 700),
        borderHex: getHex(palette, 300),
        borderMutedHex: getHex(palette, 100),
      };
    case 'dark':
      return {
        label: 'Dark',
        bgHex: getHex(palette, 875),
        textHex: getHex(palette, 75),
        isDark: true,
        cardHex: getHex(palette, 850),
        elevatedHex: getHex(palette, 825),
        activeHex: getHex(palette, 800),
        mutedHex: getHex(palette, 700),
        mutedFgHex: getHex(palette, 300),
        borderHex: getHex(palette, 600),
        borderMutedHex: getHex(palette, 700),
      };
    case 'light-hc':
      return {
        label: 'Light High Contrast',
        bgHex: getHex(neutral, 75),
        textHex: '#000000',
        isDark: false,
        cardHex: '#FFFFFF',
        elevatedHex: getHex(neutral, 25),
        activeHex: getHex(neutral, 50),
        mutedHex: getHex(neutral, 200),
        mutedFgHex: getHex(neutral, 700),
        borderHex: getHex(neutral, 400),
        borderMutedHex: getHex(neutral, 300),
      };
    case 'dark-hc':
      return {
        label: 'Dark High Contrast',
        bgHex: getHex(neutral, 925),
        textHex: '#FFFFFF',
        isDark: true,
        cardHex: '#000000',
        elevatedHex: getHex(neutral, 975),
        activeHex: getHex(neutral, 950),
        mutedHex: getHex(neutral, 700),
        mutedFgHex: getHex(neutral, 300),
        borderHex: getHex(neutral, 500),
        borderMutedHex: getHex(neutral, 600),
      };
  }
}

interface SurfaceCard { name: string; bg: string; token: string }

function getSurfaceCards(
  panelType: SurfacePanelProps['panelType'],
  c: PanelConfig,
  brand: Record<number, PaletteEntry>,
): SurfaceCard[] {
  switch (panelType) {
    case 'light':
      return [
        { name: 'Card', bg: c.cardHex, token: 'surface-25' },
        { name: 'Elevated', bg: c.elevatedHex, token: 'surface-50' },
        { name: 'Accent', bg: getHex(brand, 100), token: 'brand-100' },
        { name: 'Muted', bg: c.mutedHex, token: 'surface-200' },
      ];
    case 'dark':
      return [
        { name: 'Card', bg: c.cardHex, token: 'surface-850' },
        { name: 'Elevated', bg: c.elevatedHex, token: 'surface-825' },
        { name: 'Accent', bg: getHex(brand, 800), token: 'brand-800' },
        { name: 'Muted', bg: c.mutedHex, token: 'surface-700' },
      ];
    case 'light-hc':
      return [
        { name: 'Card', bg: c.cardHex, token: '#fff' },
        { name: 'Elevated', bg: c.elevatedHex, token: 'neutral-25' },
        { name: 'Accent', bg: getHex(brand, 100), token: 'brand-100' },
        { name: 'Muted', bg: c.mutedHex, token: 'neutral-200' },
      ];
    case 'dark-hc':
      return [
        { name: 'Card', bg: c.cardHex, token: '#000' },
        { name: 'Elevated', bg: c.elevatedHex, token: 'neutral-975' },
        { name: 'Accent', bg: getHex(brand, 800), token: 'brand-800' },
        { name: 'Muted', bg: c.mutedHex, token: 'neutral-700' },
      ];
  }
}

export function SurfacePanel({
  panelType,
  palette,
  neutral,
  brand,
  error,
  errorSurface,
  brandSwatchOverride,
  brandInvert,
  errorSwatchOverride,
  errorInvert,
  accentPalettes,
  fgContrastMode,
  shapeTokens,
}: SurfacePanelProps) {
  const config = getPanelConfig(panelType, palette, neutral);
  const { label, bgHex, textHex, isDark, cardHex, elevatedHex, activeHex, mutedHex, mutedFgHex, borderHex, borderMutedHex } = config;

  const bw = shapeTokens?.borderEnabled !== false ? (shapeTokens?.borderWidth ?? 1) : 0;
  const br = shapeTokens?.borderRadius ?? 8;

  const surfaceCards = getSurfaceCards(panelType, config, brand);

  // Button colors
  const pinnedHex = brandSwatchOverride?.hex;
  const primaryBg = pinnedHex
    ? (isDark && brandInvert ? invertHex(pinnedHex) : pinnedHex)
    : (isDark ? getHex(brand, 400) : getHex(brand, 600));
  const secondaryBg = isDark ? getHex(brand, 800) : getHex(brand, 200);
  const pinnedErrorHex = errorSwatchOverride?.hex;
  const destructiveBg = pinnedErrorHex
    ? (isDark && errorInvert ? invertHex(pinnedErrorHex) : pinnedErrorHex)
    : (isDark ? getHex(error, 400) : getHex(error, 600));

  const primaryFg = chooseFg(primaryBg, fgContrastMode);
  const secondaryFg = chooseFg(secondaryBg, fgContrastMode);
  const destructiveFg = chooseFg(destructiveBg, fgContrastMode);

  // Shadows
  const shadows = generateShadowValues(bgHex, isDark);

  // Accent items for mini badges
  const accentItems = accentPalettes.map((accent) => {
    const accentLookup: Record<number, PaletteEntry> = {};
    for (const e of accent.slatedPalette) {
      accentLookup[e.step as number] = e;
    }
    const accentActionLookup: Record<number, PaletteEntry> = {};
    for (const e of accent.palette) {
      accentActionLookup[e.step as number] = e;
    }
    const dotBg = accent.pin
      ? (isDark && accent.invert ? invertHex(accent.hex) : accent.hex)
      : (isDark ? getHex(accentActionLookup, 400) : getHex(accentActionLookup, 600));
    const badgeBg = isDark ? getHex(accentLookup, 800) : getHex(accentLookup, 100);
    const badgeBorder = isDark ? getHex(accentLookup, 700) : getHex(accentLookup, 300);
    const badgeText = isDark ? getHex(accentActionLookup, 50) : getHex(accentActionLookup, 950);
    return { name: accent.name, dotBg, badgeBg, badgeBorder, badgeText };
  });

  return (
    <div
      className="p-5 flex flex-col gap-4"
      style={{ backgroundColor: bgHex, color: textHex, border: bw ? `${bw}px solid ${borderMutedHex}` : 'none', borderRadius: br + 4 }}
    >
      {/* Header row: label + title + borders left, illustration right */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <span
            className="text-caption font-semibold uppercase tracking-wider px-1.5 py-0.5 inline-flex items-center gap-1 mb-1"
            style={{
              backgroundColor: bgHex,
              border: bw ? `${bw}px solid ${borderMutedHex}` : 'none',
              borderRadius: Math.max(4, br - 4),
              color: textHex,
            }}
          >
            {panelType === 'light' && <Sun size={11} />}
            {panelType === 'dark' && <Moon size={11} />}
            {panelType === 'light-hc' && <SunDim size={11} />}
            {panelType === 'dark-hc' && <MoonStar size={11} />}
            {label}
          </span>
          <h3 className="text-body-s font-semibold mb-3" style={{ color: textHex }}>
            {panelType === 'light' ? 'Surfaces' :
             panelType === 'dark' ? 'Surfaces' :
             'Neutral Surfaces'}
          </h3>
          {/* Borders */}
          <div className="flex gap-3 pr-3">
            <div className="flex-1">
              <div className="h-px" style={{ backgroundColor: borderHex }} />
              <span className="text-caption font-semibold mt-1 block" style={{ color: mutedFgHex }}>Border</span>
            </div>
            <div className="flex-1">
              <div className="h-px" style={{ backgroundColor: borderMutedHex }} />
              <span className="text-caption font-semibold mt-1 block" style={{ color: mutedFgHex }}>Border Muted</span>
            </div>
          </div>
        </div>
        <div className="w-28 -mt-1 -mr-1">
          <PanelSvg
            key={`${panelType}-${getHex(brand, 300)}-${getHex(brand, 500)}-${getHex(palette, 75)}-${accentPalettes.map(a => a.hex).join(',')}`}
            idx={['light', 'dark', 'light-hc', 'dark-hc'].indexOf(panelType)}
            panelType={panelType}
            brand={brand}
          />
        </div>
      </div>

      {/* Surface cards — full width */}
      <div className="grid grid-cols-4 gap-2">
        {surfaceCards.map((card) => (
          <div
            key={card.name}
            className="p-2.5 text-caption flex flex-col justify-between min-h-20"
            style={{
              backgroundColor: card.bg,
              color: textHex,
              border: bw ? `${bw}px solid ${borderMutedHex}` : 'none',
              borderRadius: br,
            }}
          >
            <span className="font-medium">{card.name}</span>
            <span className="text-caption font-mono" style={{ color: mutedFgHex }}>{card.token}</span>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <div
          className="px-3 py-1.5 text-caption font-medium"
          style={{ backgroundColor: primaryBg, color: primaryFg, borderRadius: Math.max(4, br - 2) }}
        >
          Primary
        </div>
        <div
          className="px-3 py-1.5 text-caption font-medium"
          style={{ backgroundColor: secondaryBg, color: secondaryFg, borderRadius: Math.max(4, br - 2) }}
        >
          Secondary
        </div>
        <div
          className="px-3 py-1.5 text-caption font-medium"
          style={{ backgroundColor: destructiveBg, color: destructiveFg, borderRadius: Math.max(4, br - 2) }}
        >
          Destructive
        </div>
      </div>

      {/* Badges: Error + Accents */}
      <div className="flex gap-2 flex-wrap">
        {/* Error badge */}
        {(() => {
          const errDotBg = isDark ? getHex(error, 400) : getHex(error, 600);
          const errBadgeBg = isDark ? getHex(errorSurface, 800) : getHex(errorSurface, 100);
          const errBadgeText = isDark ? getHex(error, 50) : getHex(error, 950);
          const errBorderHex = isDark ? getHex(errorSurface, 700) : getHex(errorSurface, 300);
          return (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-caption font-semibold"
              style={{ backgroundColor: errBadgeBg, color: errBadgeText, border: bw ? `${bw}px solid ${errBorderHex}` : 'none', borderRadius: br }}
            >
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: errDotBg }} />
              Error
            </div>
          );
        })()}
        {/* Accent badges */}
        {accentItems.map((item) => (
          <div
            key={item.name}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-caption font-semibold"
            style={{ backgroundColor: item.badgeBg, color: item.badgeText, border: bw ? `${bw}px solid ${item.badgeBorder}` : 'none', borderRadius: br }}
          >
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: item.dotBg }} />
            {item.name}
          </div>
        ))}
      </div>

      {/* Shadow circles */}
      <div className="flex items-end gap-3 pt-1">
        {shadows.map((s) => (
          <div key={s.name} className="flex flex-col items-center gap-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: cardHex,
                boxShadow: s.shadow,
                color: textHex,
                border: bw ? `${bw}px solid ${borderMutedHex}` : 'none',
              }}
            >
              <span className="text-caption font-semibold" style={{ color: mutedFgHex }}>{s.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
