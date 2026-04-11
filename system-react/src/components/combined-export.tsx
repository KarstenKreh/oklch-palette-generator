import { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CodeBlock } from '@core/code-block';
import type { DecodedColorState } from '@/lib/color-url-state';
import type { UrlState } from '@/lib/type-url-state';
import type { PaletteEntry } from '@core/palette';
import type { AccentPalette } from '@/lib/color-code-export';
import type { ComputedLevel } from '@core/scale';
import type { SpacingToken } from '@core/spacing';
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
  generateLlmBriefing as generateTypeLlmBriefing,
} from '@/lib/type-code-export';
import {
  generateShapeCss,
  generateShapeTailwind,
  generateLlmBriefing as generateShapeLlmBriefing,
  optsFromState as shapeOptsFromState,
} from '@/lib/shape-code-export';
import type { SymbolState } from '@/lib/symbol-url-state';
import { computeIconTokens, weightToStroke } from '@core/icon-tokens';
import { ICON_SETS, getSetById } from '@core/icon-sets';
import { recommendSets } from '@core/recommend';

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
  symbolState: SymbolState | null;
  surfaceHex?: string;
}

function getScaleLabel(typeState: UrlState | null): string {
  if (!typeState) return 'Custom Ratio';
  if (typeState.scaleMode === 'traditional') return 'Traditional Scale';
  const r = typeState.customRatio;
  if (Math.abs(r - 1.272) < 0.001) return 'Custom Ratio (√φ ≈ 1.272)';
  return `Custom Ratio (${r})`;
}

function generateSymbolCss(sym: SymbolState): string {
  const set = sym.selectedSet ? getSetById(sym.selectedSet) || ICON_SETS[0] : (() => {
    const r = recommendSets({ style: sym.preferredStyle, mood: 50, weight: sym.preferredWeight, corners: sym.preferredCorners });
    return r[0]?.set || ICON_SETS[0];
  })();
  const tokens = computeIconTokens(sym.iconBaseSize, sym.iconScale, weightToStroke(set.strokeWeight));
  const lines = [
    `/* Icon Tokens — standby.design/symbol */`,
    `/* Recommended: ${set.name} (${set.id}) */`,
    `:root {`,
    ...tokens.sizes.map((s) => `  --icon-${s.name}: ${s.rem}rem;`),
    `  --icon-stroke: ${tokens.strokeWidth}px;`,
    `}`,
  ];
  return lines.join('\n');
}

function generateSymbolTailwind(sym: SymbolState): string {
  const set = sym.selectedSet ? getSetById(sym.selectedSet) || ICON_SETS[0] : (() => {
    const r = recommendSets({ style: sym.preferredStyle, mood: 50, weight: sym.preferredWeight, corners: sym.preferredCorners });
    return r[0]?.set || ICON_SETS[0];
  })();
  const tokens = computeIconTokens(sym.iconBaseSize, sym.iconScale, weightToStroke(set.strokeWeight));
  const lines = [
    `/* Icon Tokens — standby.design/symbol */`,
    `/* Recommended: ${set.name} (${set.id}) */`,
    `@theme {`,
    ...tokens.sizes.map((s) => `  --icon-${s.name}: ${s.rem}rem;`),
    `  --icon-stroke: ${tokens.strokeWidth}px;`,
    `}`,
  ];
  return lines.join('\n');
}

function generateSymbolLlmBriefing(sym: SymbolState): string {
  const set = sym.selectedSet ? getSetById(sym.selectedSet) || ICON_SETS[0] : (() => {
    const r = recommendSets({ style: sym.preferredStyle, mood: 50, weight: sym.preferredWeight, corners: sym.preferredCorners });
    return r[0]?.set || ICON_SETS[0];
  })();
  const tokens = computeIconTokens(sym.iconBaseSize, sym.iconScale, weightToStroke(set.strokeWeight));
  return [
    `# Icon System — standby.design/symbol`,
    ``,
    `**Recommended:** ${set.name} — ${set.description}`,
    `- Install: \`npm install ${set.npmPackage}\``,
    `- Style: ${set.style}, Weight: ${set.strokeWeight}, Corners: ${set.cornerStyle}`,
    ``,
    `| Token | Value |`,
    `|-------|-------|`,
    ...tokens.sizes.map((s) => `| --icon-${s.name} | ${s.rem}rem (${s.px}px) |`),
    `| --icon-stroke | ${tokens.strokeWidth}px |`,
  ].join('\n');
}

export function CombinedExport({ colorState, palette, typeState, scale, spacing, shapeState, symbolState, surfaceHex }: CombinedExportProps) {
  const [activeTab, setActiveTab] = useState('css');

  // Copy All state
  const [copyFormat, setCopyFormat] = useState<'css' | 'tailwind'>('css');
  const [copyEmbed, setCopyEmbed] = useState(true);
  const [copyLlm, setCopyLlm] = useState(true);

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

  const symbolCss = useMemo(() => {
    if (!symbolState) return '';
    return generateSymbolCss(symbolState);
  }, [symbolState]);

  const symbolTailwind = useMemo(() => {
    if (!symbolState) return '';
    return generateSymbolTailwind(symbolState);
  }, [symbolState]);

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

    // Type briefing
    if (typeState && scale && spacing) {
      if (md) md += '\n---\n\n';
      md += generateTypeLlmBriefing({
        levels: scale,
        spacingTokens: spacing,
        headingFont: typeState.headingFont,
        bodyFont: typeState.bodyFont,
        monoFont: typeState.monoFont,
        scaleLabel: getScaleLabel(typeState),
      });
    }

    // Shape briefing
    if (shapeState) {
      const opts = shapeOptsFromState(shapeState, surfaceHex);
      if (md) md += '\n---\n\n';
      md += generateShapeLlmBriefing(opts);
    }

    // Symbol briefing
    if (symbolState) {
      if (md) md += '\n---\n\n';
      md += generateSymbolLlmBriefing(symbolState);
    }

    return md || '<!-- No configuration available -->';
  }, [colorState, palette, typeState, scale, spacing, shapeState, surfaceHex, symbolState]);

  const outputs = useMemo(() => {
    const css = [colorCss, typeCss, shapeCss, symbolCss].filter(Boolean).join('\n') || '/* No configuration available */';
    const tailwind = [colorCss, typeTailwind, shapeTailwind, symbolTailwind].filter(Boolean).join('\n') || '/* No configuration available */';
    const embed = fontEmbed || '<!-- No fonts selected -->';
    return { css, tailwind, embed, llm: llmBriefing };
  }, [colorCss, typeCss, typeTailwind, shapeCss, shapeTailwind, symbolCss, symbolTailwind, fontEmbed, llmBriefing]);

  const handleCopyAll = useCallback(() => {
    const parts: string[] = [];
    parts.push(copyFormat === 'css' ? outputs.css : outputs.tailwind);
    if (copyEmbed) parts.push(outputs.embed);
    if (copyLlm) parts.push(outputs.llm);
    const combined = parts.join('\n\n');
    navigator.clipboard.writeText(combined).then(() => toast('All selected sections copied!'));
  }, [copyFormat, copyEmbed, copyLlm, outputs]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-body-s font-semibold">Combined Export</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Copy className="h-3.5 w-3.5" />
              Copy All
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-3">
            <div className="space-y-3">
              <div>
                <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wider">Format</span>
                <div className="flex gap-1 mt-1.5">
                  <Button
                    variant={copyFormat === 'css' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-7 text-caption"
                    onClick={() => setCopyFormat('css')}
                  >
                    CSS
                  </Button>
                  <Button
                    variant={copyFormat === 'tailwind' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-7 text-caption"
                    onClick={() => setCopyFormat('tailwind')}
                  >
                    Tailwind
                  </Button>
                </div>
              </div>

              <div className="border-t border-border pt-2 space-y-2">
                <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wider">Include</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={copyEmbed} onCheckedChange={(v) => setCopyEmbed(!!v)} />
                  <span className="text-caption">Font Embed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={copyLlm} onCheckedChange={(v) => setCopyLlm(!!v)} />
                  <span className="text-caption">LLM Briefing</span>
                </label>
              </div>

              <Button size="sm" className="w-full" onClick={handleCopyAll}>
                Copy Selected
              </Button>
            </div>
          </PopoverContent>
        </Popover>
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
          <CodeBlock code={outputs.css} mode="css" />
        </TabsContent>
        <TabsContent value="tailwind">
          <CodeBlock code={outputs.tailwind} mode="css" />
        </TabsContent>
        <TabsContent value="embed">
          <CodeBlock code={outputs.embed} mode="html" />
        </TabsContent>
        <TabsContent value="llm">
          <CodeBlock code={outputs.llm} mode="markdown" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
