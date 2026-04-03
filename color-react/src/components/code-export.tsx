import { useState, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { usePalette } from '@/hooks/use-palette';
import { useThemeStore } from '@/store/theme-store';
import { generatePrimitivesOklch, generatePrimitivesHex, generateSemantic, generateLlmBriefing } from '@/lib/code-export';

function highlightCss(code: string) {
  return code.split('\n').map((line, i) => {
    if (line.trim().startsWith('/*')) {
      return <span key={i} className="text-muted-foreground/60">{line}{'\n'}</span>;
    }
    const match = line.match(/^(\s*)(--[\w-]+)(:\s*)(.+)(;)$/);
    if (match) {
      return (
        <span key={i}>
          {match[1]}<span className="text-sky-400">{match[2]}</span>{match[3]}<span className="text-orange-300">{match[4]}</span>{match[5]}{'\n'}
        </span>
      );
    }
    return <span key={i}>{line}{'\n'}</span>;
  });
}

function highlightMarkdown(code: string) {
  return code.split('\n').map((line, i) => {
    if (line.startsWith('# '))
      return <span key={i} className="text-foreground font-bold text-caption">{line}{'\n'}</span>;
    if (line.startsWith('## '))
      return <span key={i} className="text-foreground font-semibold text-caption">{line}{'\n'}</span>;
    if (line.startsWith('### '))
      return <span key={i} className="text-muted-foreground font-semibold">{line}{'\n'}</span>;
    if (line.startsWith('|'))
      return <span key={i} className="text-sky-400/80">{line}{'\n'}</span>;
    if (line.startsWith('- '))
      return <span key={i} className="text-orange-300/80">{line}{'\n'}</span>;
    if (line.match(/^\d+\./))
      return <span key={i} className="text-orange-300/80">{line}{'\n'}</span>;
    return <span key={i}>{line}{'\n'}</span>;
  });
}

function CodeBlock({ code, id, highlight = 'css' }: { code: string; id: string; highlight?: 'css' | 'markdown' }) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => toast('Copied to clipboard'));
  }, [code]);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 z-10"
        onClick={handleCopy}
      >
        Copy
      </Button>
      <pre
        id={id}
        className="bg-black/30 border border-border rounded-lg p-4 pt-12 overflow-x-auto text-caption font-mono leading-relaxed max-h-[600px] overflow-y-auto"
      >
        <code>{highlight === 'markdown' ? highlightMarkdown(code) : highlightCss(code)}</code>
      </pre>
    </div>
  );
}

export function CodeExport() {
  const {
    brand, surface, error, errorSurface, neutralExtended, accentPalettes,
    brandSwatchOverride, errorSwatchOverride, effectiveBgHex, effectiveErrorHex,
  } = usePalette();
  const store = useThemeStore();
  const { chromaScale, brandHex, brandPin, errorPin, fgContrastMode, themeName, currentMode } = store;

  // Copy dropdown state
  const [copyFormat, setCopyFormat] = useState<'oklch' | 'hex'>('oklch');
  const [copySemantic, setCopySemantic] = useState(true);
  const [copyLlm, setCopyLlm] = useState(true);

  const customBgHex = effectiveBgHex.toLowerCase() !== brandHex.toLowerCase() ? effectiveBgHex : null;

  const oklchCode = useMemo(() =>
    generatePrimitivesOklch(brand, surface, error, errorSurface, neutralExtended, accentPalettes, chromaScale, customBgHex, themeName),
    [brand, surface, error, errorSurface, neutralExtended, accentPalettes, chromaScale, customBgHex, themeName]
  );

  const hexCode = useMemo(() =>
    generatePrimitivesHex(brand, surface, error, errorSurface, neutralExtended, accentPalettes, chromaScale, customBgHex, themeName),
    [brand, surface, error, errorSurface, neutralExtended, accentPalettes, chromaScale, customBgHex, themeName]
  );

  const semanticCode = useMemo(() =>
    generateSemantic(
      accentPalettes, brand, error, errorSurface, surface,
      brandPin, brandSwatchOverride?.hex ?? null,
      errorPin, errorSwatchOverride?.hex ?? null,
      fgContrastMode, themeName
    ),
    [accentPalettes, brand, error, errorSurface, surface, brandPin, brandSwatchOverride, errorPin, errorSwatchOverride, fgContrastMode, themeName]
  );

  const llmCode = useMemo(() =>
    generateLlmBriefing(brandHex, effectiveBgHex, effectiveErrorHex, accentPalettes, chromaScale, currentMode, brandPin, errorPin, themeName, fgContrastMode),
    [brandHex, effectiveBgHex, effectiveErrorHex, accentPalettes, chromaScale, currentMode, brandPin, errorPin, themeName, fgContrastMode]
  );

  const handleCopyAll = useCallback(() => {
    const parts: string[] = [];
    parts.push(copyFormat === 'oklch' ? oklchCode : hexCode);
    if (copySemantic) parts.push(semanticCode);
    if (copyLlm) parts.push(llmCode);
    const combined = parts.join('\n\n');
    navigator.clipboard.writeText(combined).then(() => toast('All selected sections copied!'));
  }, [copyFormat, copySemantic, copyLlm, oklchCode, hexCode, semanticCode, llmCode]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-body-s font-semibold mb-0.5">Export</h2>
          <p className="text-caption text-muted-foreground">
            Copy individual tabs or use the dropdown to bundle multiple sections
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              Copy All
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-3">
            <div className="space-y-3">
              <div>
                <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wider">Primitives Format</span>
                <div className="flex gap-1 mt-1.5">
                  <Button
                    variant={copyFormat === 'oklch' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-7 text-caption"
                    onClick={() => setCopyFormat('oklch')}
                  >
                    OKLCH
                  </Button>
                  <Button
                    variant={copyFormat === 'hex' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-7 text-caption"
                    onClick={() => setCopyFormat('hex')}
                  >
                    Hex
                  </Button>
                </div>
              </div>

              <div className="border-t border-border pt-2 space-y-2">
                <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wider">Include</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={copySemantic} onCheckedChange={(v) => setCopySemantic(!!v)} />
                  <span className="text-caption">Semantic Tokens</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={copyLlm} onCheckedChange={(v) => setCopyLlm(!!v)} />
                  <span className="text-caption">LLM Instructions</span>
                </label>
              </div>

              <Button size="sm" className="w-full" onClick={handleCopyAll}>
                Copy Selected
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Tabs defaultValue="oklch">
        <TabsList>
          <TabsTrigger value="oklch">Primitives OKLCH</TabsTrigger>
          <TabsTrigger value="hex">Primitives Hex</TabsTrigger>
          <TabsTrigger value="semantic">Semantic</TabsTrigger>
          <TabsTrigger value="llm">LLM Briefing</TabsTrigger>
        </TabsList>
        <TabsContent value="oklch">
          <CodeBlock code={oklchCode} id="code-oklch" />
        </TabsContent>
        <TabsContent value="hex">
          <CodeBlock code={hexCode} id="code-hex" />
        </TabsContent>
        <TabsContent value="semantic">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">Semantic Layer</Badge>
            <span className="text-caption text-muted-foreground">
              References Primitive Tokens — paste after your :root block
            </span>
          </div>
          <CodeBlock code={semanticCode} id="code-semantic" />
        </TabsContent>
        <TabsContent value="llm">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">LLM Briefing</Badge>
            <span className="text-caption text-muted-foreground">
              Paste into your AI prompt to explain your design system tokens
            </span>
          </div>
          <CodeBlock code={llmCode} id="code-llm" highlight="markdown" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
