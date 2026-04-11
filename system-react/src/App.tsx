import { useEffect, useMemo, useState, useCallback, type CSSProperties } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getMySegment, buildUnifiedHash } from '@core/unified-hash';
import { ToolNav } from '@/components/tool-nav';
import { decodeState as decodeColorState, encodeState as encodeColorState, type DecodedColorState } from '@/lib/color-url-state';
import { decodeState as decodeTypeState } from '@/lib/type-url-state';
import { decodeState as decodeShapeState, type ShapeState } from '@/lib/shape-url-state';
import { generatePalette, computeAutoErrorHex, computeAutoAccentHex, type PaletteEntry } from '@core/palette';
import { hexToOklch } from '@core/color-math';
import { customScale, traditionalScale, type ComputedLevel } from '@/lib/scale';
import { applyTypography } from '@/lib/typography';
import { computeSpacingTokens, type SpacingToken } from '@/lib/spacing';
import type { AccentPalette } from '@/lib/color-code-export';
import { SUCCESS_HUE, WARNING_HUE, INFO_HUE } from '@core/palette';
import { ColorSummary } from '@/components/color-summary';
import { TypeSummary } from '@/components/type-summary';
import { CombinedExport } from '@/components/combined-export';
import { AppPreview } from '@/components/app-preview';
import { PirateFooter } from '@/components/pirate-footer';
import { SquarePen } from 'lucide-react';

function accentCssName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'accent';
}

const DEFAULT_COLOR_STATE: DecodedColorState = {
  brandHex: '#335A7F',
  bgColorHex: '#335A7F',
  bgAutoMatch: true,
  errorColorHex: '#CC3333',
  errorAutoMatch: true,
  chromaScale: 0.25,
  currentMode: 'balanced',
  brandPin: false,
  brandInvert: false,
  errorPin: false,
  errorInvert: false,
  fgContrastMode: 'best',
  themeName: '',
  extraAccents: [
    { name: 'Success', hex: '#33994D', pin: false, invert: false, autoMatch: true, autoHue: SUCCESS_HUE },
    { name: 'Warning', hex: '#998033', pin: false, invert: false, autoMatch: true, autoHue: WARNING_HUE },
    { name: 'Info', hex: '#3355CC', pin: false, invert: false, autoMatch: true, autoHue: INFO_HUE },
  ],
};

const DEFAULT_TYPE_HASH = 'custom,1,1.272,1.19,satoshi,satoshi,system-mono';

const DEFAULT_SHAPE_STATE: Partial<ShapeState> = {
  shadowEnabled: true,
  shadowType: 'normal',
  shadowStrength: 1.0,
  shadowBlurScale: 1.0,
  shadowScale: 1.272,
  shadowColorMode: 'auto',
  shadowCustomColor: '#000000',
  borderEnabled: true,
  borderWidth: 1,
  borderColorMode: 'auto',
  borderCustomColor: '#000000',
  borderRadius: 8,
  glassEnabled: false,
  glassBlur: 12,
  glassOpacity: 0.8,
  ringWidth: 2,
  ringOffset: 2,
  ringColorMode: 'auto',
  ringCustomColor: '#000000',
  separationMode: 'shadow',
};


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
  const [themeName, setThemeName] = useState('');

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

    if (cs) {
      const decoded = decodeColorState(cs);
      setColorState(decoded);
      if (decoded?.themeName) setThemeName(decoded.themeName);
    }
    if (ts) setTypeState(decodeTypeState(ts));
    if (ss) setShapeState(decodeShapeState(ss));

    // Fill in defaults for any missing segments
    if (!cs) setColorState(DEFAULT_COLOR_STATE);
    if (!ts) setTypeState(decodeTypeState(DEFAULT_TYPE_HASH));
    if (!ss) setShapeState(DEFAULT_SHAPE_STATE);
  }, []);

  useEffect(() => {
    document.title = themeName && themeName !== 'Standby.Design'
      ? `${themeName} — Design System`
      : 'Design System — standby.design';
  }, [themeName]);

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
      s = customScale(typeState.baseSize, typeState.customRatio, effectiveMobileRatio, typeState.mobileBaseSize ?? typeState.baseSize);
    }
    s = applyTypography(s, typeState.lineHeightOverrides ?? {}, typeState.letterSpacingOverrides ?? {});
    return s;
  }, [typeState]);

  const spacing = useMemo<SpacingToken[] | null>(() => {
    if (!scale) return null;
    return computeSpacingTokens(scale, typeState?.spacingBaseMultiplier ?? 1.0);
  }, [scale, typeState]);

  const handleNameChange = useCallback((name: string) => {
    setThemeName(name);
    if (colorState) {
      const updated = { ...colorState, themeName: name };
      setColorState(updated);
      const newColorSegment = encodeColorState(updated);
      setColorSegment(newColorSegment);
      history.replaceState(null, '', '#' + buildUnifiedHash({
        c: newColorSegment, t: typeSegment || undefined, s: shapeSegment || undefined,
      }));
    }
  }, [colorState, typeSegment, shapeSegment]);

  const getCurrentHash = useCallback(() => {
    return buildUnifiedHash({ c: colorSegment || undefined, t: typeSegment || undefined, s: shapeSegment || undefined });
  }, [colorSegment, typeSegment, shapeSegment]);

  const handleShare = useCallback(() => {
    const hash = getCurrentHash();
    const params = new URLSearchParams();
    if (colorState) {
      const name = colorState.themeName?.trim();
      const hex = colorState.brandHex?.replace('#', '');
      if (name) params.set('t', name);
      if (hex && /^[0-9a-fA-F]{6}$/.test(hex)) params.set('c', hex);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const url = window.location.origin + '/system/' + query + '#' + hash;
    navigator.clipboard.writeText(url).then(() => toast('Share link copied!'));
  }, [getCurrentHash, colorState]);

  const [screenIdx, setScreenIdx] = useState(0);
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
                value={themeName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="My Design System"
                className="text-foreground font-semibold w-full rounded-lg border border-border bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/40"
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold" style={{ fontSize: 'var(--text-body-l, 1.125rem)' }}>Preview</h2>
              <div className="flex items-center rounded-md border border-border overflow-hidden">
                {(['Dashboard', 'Messages', 'Profile'] as const).map((name, i) => (
                  <button
                    key={name}
                    onClick={() => setScreenIdx(i)}
                    className={`px-2.5 py-1 text-caption font-medium transition-colors cursor-pointer ${
                      screenIdx === i ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <AppPreview
              palette={palette}
              scale={scale}
              spacing={spacing}
              shape={shapeState}
              themeName={themeName}
              headingFont={typeState?.headingFont}
              bodyFont={typeState?.bodyFont}
              headingWeight={typeState?.headingWeight}
              screenIdx={screenIdx}
              fgContrastMode={colorState?.fgContrastMode}
            />
          </div>
        )}

        {/* Color Summary */}
        {hasColor && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold" style={{ fontSize: 'var(--text-body-l, 1.125rem)' }}>Color Palette</h2>
              <a
                href={`/color#${getCurrentHash()}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors pr-1"
              >
                <SquarePen size={14} />
                Edit
              </a>
            </div>
            <ColorSummary palette={palette} />
          </div>
        )}

        {/* Type Summary */}
        {hasType && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold" style={{ fontSize: 'var(--text-body-l, 1.125rem)' }}>Typography</h2>
              <a
                href={`/type#${getCurrentHash()}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors pr-1"
              >
                <SquarePen size={14} />
                Edit
              </a>
            </div>
            <TypeSummary scale={scale} spacing={spacing} typeState={typeState} />
          </div>
        )}

        {/* Combined Export */}
        {(hasColor || hasType || shapeState) && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <CombinedExport
              colorState={hasColor ? colorState : null}
              palette={palette}
              typeState={typeState}
              scale={scale}
              spacing={spacing}
              shapeState={shapeState}
              surfaceHex={palette?.effectiveBgHex}
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
