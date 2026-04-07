import { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';
import type { DecodedColorState } from '@/lib/color-url-state';
import type { UrlState } from '@/lib/type-url-state';
import type { PaletteEntry } from '@/lib/palette';
import type { AccentPalette } from '@/lib/color-code-export';
import type { ComputedLevel } from '@/lib/scale';
import type { SpacingToken } from '@/lib/spacing';
import {
  generatePrimitivesOklch,
  generateSemantic,
} from '@/lib/color-code-export';
import { generateShadowValues } from '@/lib/shadows';
import {
  generateCssExport as generateTypeCss,
  generateTailwindV4Export as generateTypeTailwind,
  generateFontEmbed,
} from '@/lib/type-code-export';

interface PaletteResult {
  brand: PaletteEntry[];
  surface: PaletteEntry[];
  error: PaletteEntry[];
  errorSurface: PaletteEntry[];
  neutralExtended: PaletteEntry[];
  accentPalettes: AccentPalette[];
  brandSwatchOverride: { hex: string; L: number } | null;
  errorSwatchOverride: { hex: string; L: number } | null;
  effectiveBgHex: string;
  effectiveErrorHex: string;
}

interface CombinedExportProps {
  colorState: DecodedColorState | null;
  palette: PaletteResult | null;
  typeState: UrlState | null;
  scale: ComputedLevel[] | null;
  spacing: SpacingToken[] | null;
}

type Tab = 'css' | 'tailwind' | 'embed';

function getScaleLabel(typeState: UrlState | null): string {
  if (!typeState) return 'Custom Ratio';
  if (typeState.scaleMode === 'traditional') return 'Traditional Scale';
  const r = typeState.customRatio;
  if (Math.abs(r - 1.272) < 0.001) return 'Custom Ratio (√φ ≈ 1.272)';
  return `Custom Ratio (${r})`;
}

export function CombinedExport({ colorState, palette, typeState, scale, spacing }: CombinedExportProps) {
  const [activeTab, setActiveTab] = useState<Tab>('css');
  const [copied, setCopied] = useState(false);

  const colorCss = useMemo(() => {
    if (!colorState || !palette) return '';

    let css = '';

    // Primitives
    css += generatePrimitivesOklch(
      palette.brand, palette.surface, palette.error,
      palette.errorSurface, palette.neutralExtended,
      palette.accentPalettes, colorState.chromaScale,
      colorState.bgAutoMatch ? null : colorState.bgColorHex,
      colorState.themeName,
    );

    css += '\n';

    // Semantic tokens
    css += generateSemantic(
      palette.accentPalettes,
      palette.brand, palette.error, palette.errorSurface, palette.surface,
      colorState.brandPin, colorState.brandPin ? colorState.brandHex : null, colorState.brandInvert,
      colorState.errorPin, colorState.errorPin ? palette.effectiveErrorHex : null, colorState.errorInvert,
      colorState.fgContrastMode, colorState.themeName,
    );

    return css;
  }, [colorState, palette]);

  const typeCss = useMemo(() => {
    if (!typeState || !scale || !spacing) return '';
    return generateTypeCss({
      levels: scale,
      spacingTokens: spacing,
      headingFont: typeState.headingFont,
      bodyFont: typeState.bodyFont,
      monoFont: typeState.monoFont,
      scaleLabel: getScaleLabel(typeState),
    });
  }, [typeState, scale, spacing]);

  const typeTailwind = useMemo(() => {
    if (!typeState || !scale || !spacing) return '';
    return generateTypeTailwind({
      levels: scale,
      spacingTokens: spacing,
      headingFont: typeState.headingFont,
      bodyFont: typeState.bodyFont,
      monoFont: typeState.monoFont,
      scaleLabel: getScaleLabel(typeState),
    });
  }, [typeState, scale, spacing]);

  const fontEmbed = useMemo(() => {
    if (!typeState) return '';
    return generateFontEmbed(typeState.headingFont, typeState.bodyFont, typeState.monoFont);
  }, [typeState]);

  const output = useMemo(() => {
    switch (activeTab) {
      case 'css': {
        let combined = '';
        if (colorCss) combined += colorCss;
        if (typeCss) {
          if (combined) combined += '\n';
          combined += typeCss;
        }
        return combined || '/* No configuration available */';
      }
      case 'tailwind': {
        let combined = '';
        if (colorCss) {
          // For Tailwind, reuse the CSS primitives (color tokens work in @theme too)
          combined += colorCss;
        }
        if (typeTailwind) {
          if (combined) combined += '\n';
          combined += typeTailwind;
        }
        return combined || '/* No configuration available */';
      }
      case 'embed': {
        return fontEmbed || '<!-- No fonts selected -->';
      }
    }
  }, [activeTab, colorCss, typeCss, typeTailwind, fontEmbed]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      toast('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'css', label: 'CSS' },
    { key: 'tailwind', label: 'Tailwind v4' },
    { key: 'embed', label: 'Font Embed' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-body-s font-semibold">Combined Export</h2>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="flex gap-1 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <pre className="bg-background rounded-lg p-4 text-xs overflow-x-auto max-h-[500px] overflow-y-auto font-mono leading-relaxed">
        <code>{output}</code>
      </pre>
    </div>
  );
}
