import { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DecodedColorState } from '@/lib/color-url-state';
import type { UrlState } from '@/lib/type-url-state';
import type { PaletteEntry } from '@core/palette';
import type { AccentPalette } from '@/lib/color-code-export';
import type { ComputedLevel } from '@/lib/scale';
import type { SpacingToken } from '@/lib/spacing';
import type { ShapeState } from '@/lib/shape-url-state';
import {
  generatePrimitivesOklch,
  generateSemantic,
  generateLlmBriefing as generateColorLlmBriefing,
} from '@/lib/color-code-export';
import { generateShadowValues } from '@core/shadows';
import {
  generateCssExport as generateTypeCss,
  generateTailwindV4Export as generateTypeTailwind,
  generateFontEmbed,
} from '@/lib/type-code-export';
import {
  generateShapeCss,
  generateShapeTailwind,
  generateLlmBriefing as generateShapeLlmBriefing,
  optsFromState as shapeOptsFromState,
} from '@/lib/shape-code-export';

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
  shapeState: Partial<ShapeState> | null;
  surfaceHex?: string;
}

function getScaleLabel(typeState: UrlState | null): string {
  if (!typeState) return 'Custom Ratio';
  if (typeState.scaleMode === 'traditional') return 'Traditional Scale';
  const r = typeState.customRatio;
  if (Math.abs(r - 1.272) < 0.001) return 'Custom Ratio (√φ ≈ 1.272)';
  return `Custom Ratio (${r})`;
}

export function CombinedExport({ colorState, palette, typeState, scale, spacing, shapeState, surfaceHex }: CombinedExportProps) {
  const [activeTab, setActiveTab] = useState('css');
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

  const shapeCss = useMemo(() => {
    if (!shapeState) return '';
    const opts = shapeOptsFromState(shapeState, surfaceHex);
    return generateShapeCss(opts);
  }, [shapeState, surfaceHex]);

  const shapeTailwind = useMemo(() => {
    if (!shapeState) return '';
    const opts = shapeOptsFromState(shapeState, surfaceHex);
    return generateShapeTailwind(opts);
  }, [shapeState, surfaceHex]);

  const fontEmbed = useMemo(() => {
    if (!typeState) return '';
    return generateFontEmbed(typeState.headingFont, typeState.bodyFont, typeState.monoFont);
  }, [typeState]);

  const llmBriefing = useMemo(() => {
    let md = '';

    // Color briefing
    if (colorState && palette) {
      md += generateColorLlmBriefing(
        colorState.brandHex,
        palette.effectiveBgHex,
        palette.effectiveErrorHex,
        palette.accentPalettes,
        colorState.chromaScale,
        colorState.currentMode,
        colorState.brandPin,
        colorState.errorPin,
        colorState.themeName,
        colorState.fgContrastMode,
      );
    }

    // Shape briefing
    if (shapeState) {
      const opts = shapeOptsFromState(shapeState, surfaceHex);
      if (md) md += '\n---\n\n';
      md += generateShapeLlmBriefing(opts);
    }

    return md || '<!-- No configuration available -->';
  }, [colorState, palette, shapeState, surfaceHex]);

  const outputs = useMemo(() => {
    const css = [colorCss, typeCss, shapeCss].filter(Boolean).join('\n') || '/* No configuration available */';
    const tailwind = [colorCss, typeTailwind, shapeTailwind].filter(Boolean).join('\n') || '/* No configuration available */';
    const embed = fontEmbed || '<!-- No fonts selected -->';
    return { css, tailwind, embed, llm: llmBriefing };
  }, [colorCss, typeCss, typeTailwind, shapeCss, shapeTailwind, fontEmbed, llmBriefing]);

  const currentOutput = outputs[activeTab as keyof typeof outputs] ?? outputs.css;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(currentOutput).then(() => {
      setCopied(true);
      toast('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [currentOutput]);

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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="css" className="text-caption">
            CSS Custom Properties
          </TabsTrigger>
          <TabsTrigger value="tailwind" className="text-caption">
            Tailwind v4
          </TabsTrigger>
          <TabsTrigger value="embed" className="text-caption">
            Font Embed
          </TabsTrigger>
          <TabsTrigger value="llm" className="text-caption">
            LLM Briefing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="css">
          <CodeBlock code={outputs.css} onCopy={() => { navigator.clipboard.writeText(outputs.css).then(() => toast('Copied!')); }} />
        </TabsContent>
        <TabsContent value="tailwind">
          <CodeBlock code={outputs.tailwind} onCopy={() => { navigator.clipboard.writeText(outputs.tailwind).then(() => toast('Copied!')); }} />
        </TabsContent>
        <TabsContent value="embed">
          <CodeBlock code={outputs.embed} onCopy={() => { navigator.clipboard.writeText(outputs.embed).then(() => toast('Copied!')); }} />
        </TabsContent>
        <TabsContent value="llm">
          <CodeBlock code={outputs.llm} onCopy={() => { navigator.clipboard.writeText(outputs.llm).then(() => toast('Copied!')); }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CodeBlock({ code, onCopy }: { code: string; onCopy: () => void }) {
  return (
    <div className="relative">
      <button
        onClick={onCopy}
        className="absolute top-2 right-2 h-7 w-7 p-0 z-10 inline-flex items-center justify-center rounded-md bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <pre className="bg-background border border-border rounded-md p-4 pr-10 overflow-x-auto max-h-[500px] overflow-y-auto text-xs font-mono leading-relaxed whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
