import { useEffect, useMemo, useState, useCallback } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getMySegment, buildUnifiedHash } from '@/lib/unified-hash';
import { ToolNav } from '@/components/tool-nav';
import { decodeState as decodeColorState, encodeState as encodeColorState, type DecodedColorState } from '@/lib/color-url-state';
import { decodeState as decodeTypeState } from '@/lib/type-url-state';
import { decodeState as decodeShapeState, type ShapeState } from '@/lib/shape-url-state';
import { generatePalette, computeAutoErrorHex, computeAutoAccentHex, type PaletteEntry } from '@/lib/palette';
import { hexToOklch } from '@/lib/color-math';
import { customScale, traditionalScale, type ComputedLevel } from '@/lib/scale';
import { applyWeightCompensation } from '@/lib/weight-compensation';
import { applyTypography } from '@/lib/typography';
import { computeSpacingTokens, type SpacingToken } from '@/lib/spacing';
import type { AccentPalette } from '@/lib/color-code-export';
import { ColorSummary } from '@/components/color-summary';
import { TypeSummary } from '@/components/type-summary';
import { CombinedExport } from '@/components/combined-export';
import { AppPreview } from '@/components/app-preview';
import { PirateFooter } from '@/components/pirate-footer';

function accentCssName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'accent';
}

interface PaletteResult {
  brand: PaletteEntry[];
  surface: PaletteEntry[];
  error: PaletteEntry[];
  errorSurface: PaletteEntry[];
  neutral: PaletteEntry[];
  neutralExtended: PaletteEntry[];
  slated: PaletteEntry[];
  accentPalettes: AccentPalette[];
  brandSwatchOverride: { hex: string; L: number } | null;
  errorSwatchOverride: { hex: string; L: number } | null;
  effectiveBgHex: string;
  effectiveErrorHex: string;
}

function App() {
  const [colorState, setColorState] = useState<DecodedColorState | null>(null);
  const [typeState, setTypeState] = useState<ReturnType<typeof decodeTypeState>>(null);
  const [shapeState, setShapeState] = useState<Partial<ShapeState> | null>(null);
  const [colorSegment, setColorSegment] = useState<string | null>(null);
  const [typeSegment, setTypeSegment] = useState<string | null>(null);
  const [shapeSegment, setShapeSegment] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const raw = window.location.hash.slice(1);
    const cs = getMySegment(raw, 'c');
    const ts = getMySegment(raw, 't');
    const ss = getMySegment(raw, 's');
    setColorSegment(cs);
    setTypeSegment(ts);
    setShapeSegment(ss);
    if (cs) setColorState(decodeColorState(cs));
    if (ts) setTypeState(decodeTypeState(ts));
    if (ss) setShapeState(decodeShapeState(ss));
  }, []);

  useEffect(() => {
    const name = colorState?.themeName;
    document.title = name && name !== 'Standby.Design'
      ? `${name} — Design System`
      : 'Design System — standby.design';
  }, [colorState?.themeName]);

  const palette = useMemo<PaletteResult | null>(() => {
    if (!colorState) return null;
    const { brandHex, bgColorHex, bgAutoMatch, errorColorHex, errorAutoMatch, chromaScale, currentMode, extraAccents, brandPin, errorPin } = colorState;

    const effectiveBgHex = bgAutoMatch ? brandHex : bgColorHex;
    const effectiveErrorHex = errorAutoMatch ? computeAutoErrorHex(brandHex) : errorColorHex;

    const brand = generatePalette(brandHex, 1.0, currentMode);
    const surface = generatePalette(effectiveBgHex, chromaScale, currentMode);
    const error = generatePalette(effectiveErrorHex, 1.0, currentMode);
    const errorSurface = generatePalette(effectiveErrorHex, chromaScale, currentMode);
    const neutral = generatePalette(effectiveBgHex, 0.0, currentMode);
    const slated = generatePalette(effectiveBgHex, chromaScale, currentMode);

    const accentPalettes: AccentPalette[] = (extraAccents || [])
      .filter(a => a.autoMatch || /^#[0-9a-fA-F]{6}$/.test(a.hex))
      .map(a => {
        const effectiveHex = a.autoMatch ? computeAutoAccentHex(brandHex, a.autoHue) : a.hex;
        return {
          name: a.name,
          hex: effectiveHex,
          cssName: accentCssName(a.name),
          palette: generatePalette(effectiveHex, 1.0, currentMode),
          slatedPalette: generatePalette(effectiveHex, chromaScale, currentMode),
          pin: a.pin,
          invert: a.invert,
        };
      });

    const brandSwatchOverride = brandPin ? { hex: brandHex, L: hexToOklch(brandHex)[0] } : null;
    const errorSwatchOverride = errorPin ? { hex: effectiveErrorHex, L: hexToOklch(effectiveErrorHex)[0] } : null;

    const neutralExtended: PaletteEntry[] = [
      { step: 0 as PaletteEntry['step'], L: 1, C: 0, H: 0, hex: '#FFFFFF', css: 'oklch(1 0 0)' },
      ...neutral,
      { step: 1000 as PaletteEntry['step'], L: 0, C: 0, H: 0, hex: '#000000', css: 'oklch(0 0 0)' },
    ];

    return { brand, surface, error, errorSurface, neutral, neutralExtended, slated, accentPalettes, brandSwatchOverride, errorSwatchOverride, effectiveBgHex, effectiveErrorHex };
  }, [colorState]);

  const scale = useMemo<ComputedLevel[] | null>(() => {
    if (!typeState) return null;
    let s: ComputedLevel[];
    if (typeState.scaleMode === 'traditional' && typeState.traditionalAssignments) {
      s = traditionalScale(typeState.traditionalAssignments, typeState.traditionalAssignments);
    } else {
      const effectiveMobileRatio = typeState.mobileRatio;
      s = customScale(typeState.baseSize, typeState.customRatio, effectiveMobileRatio, typeState.baseSize);
    }
    s = applyWeightCompensation(s, 500);
    s = applyTypography(s, {}, {});
    return s;
  }, [typeState]);

  const spacing = useMemo<SpacingToken[] | null>(() => {
    if (!scale) return null;
    return computeSpacingTokens(scale, 1.0);
  }, [scale]);

  const handleNameChange = useCallback((name: string) => {
    if (!colorState) return;
    const updated = { ...colorState, themeName: name };
    setColorState(updated);
    const newColorSegment = encodeColorState(updated);
    setColorSegment(newColorSegment);
    history.replaceState(null, '', '#' + buildUnifiedHash({
      c: newColorSegment, t: typeSegment || undefined, s: shapeSegment || undefined,
    }));
  }, [colorState, typeSegment, shapeSegment]);

  const getCurrentHash = useCallback(() => {
    return buildUnifiedHash({ c: colorSegment || undefined, t: typeSegment || undefined, s: shapeSegment || undefined });
  }, [colorSegment, typeSegment, shapeSegment]);

  const handleShare = useCallback(() => {
    const hash = getCurrentHash();
    const url = window.location.origin + '/system#' + hash;
    navigator.clipboard.writeText(url).then(() => toast('Share link copied!'));
  }, [getCurrentHash]);

  const hasColor = !!colorState && !!palette;
  const hasType = !!typeState && !!scale;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="hidden md:flex sticky top-0 h-screen p-3 border-r border-border">
        <ToolNav activeTool="system" buildHash={getCurrentHash} />
      </div>
      <div className="md:hidden">
        <ToolNav activeTool="system" buildHash={getCurrentHash} />
      </div>
      <div className="flex-1 min-w-0 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              <label className="text-xs text-muted-foreground mb-1 block">Name your Design System</label>
              <input
                type="text"
                value={colorState?.themeName || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="My Design System"
                className="bg-transparent text-foreground font-semibold w-full outline-none placeholder:text-muted-foreground/40"
                style={{ fontSize: 'var(--text-h4)', lineHeight: 'var(--leading-h4)' }}
              />
            </div>
            <Button variant="default" onClick={handleShare} className="shrink-0 ml-4">
              Share System
            </Button>
          </div>
        <p className="text-muted-foreground mb-6" style={{ fontSize: 'var(--text-body-s)' }}>
          Combined view of your design system &mdash; color palette, typography, spacing, and shadows in one export.
        </p>

        {!hasColor && !hasType && (
          <div className="bg-card border border-border rounded-lg p-8 text-center mb-6">
            <p className="text-muted-foreground mb-4">No design system configured yet.</p>
            <div className="flex justify-center gap-3">
              <a href="/color" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/80 transition-all">
                Start with Colors
              </a>
              <a href="/type" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-all">
                Start with Type
              </a>
            </div>
          </div>
        )}

        {/* Live App Preview */}
        {(hasColor || hasType) && (
          <div className="mb-6">
            <h2 className="text-body-s font-semibold mb-3">Preview</h2>
            <AppPreview
              palette={palette}
              scale={scale}
              spacing={spacing}
              shape={shapeState}
              themeName={colorState?.themeName || ''}
              headingFont={typeState?.headingFont}
              bodyFont={typeState?.bodyFont}
            />
          </div>
        )}

        {/* Color Summary */}
        {hasColor && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <h2 className="text-body-s font-semibold mb-3">Color Palette</h2>
            <ColorSummary palette={palette} />
          </div>
        )}

        {/* Type Summary */}
        {hasType && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <h2 className="text-body-s font-semibold mb-3">Typography</h2>
            <TypeSummary scale={scale} spacing={spacing} typeState={typeState} />
          </div>
        )}

        {/* Combined Export */}
        {(hasColor || hasType) && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <CombinedExport
              colorState={hasColor ? colorState : null}
              palette={palette}
              typeState={typeState}
              scale={scale}
              spacing={spacing}
            />
          </div>
        )}
        </div>
        <PirateFooter />
      </div>
      <Toaster />
    </div>
  );
}

export default App;
