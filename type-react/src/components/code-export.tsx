import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useComputedScale } from '@/hooks/use-computed-scale';
import { useComputedSpacing } from '@/hooks/use-computed-spacing';
import { useTypeStore } from '@/store/type-store';
import {
  generateCssExport,
  generateTailwindV4Export,
  generateFontEmbed,
} from '@/lib/code-export';
import { generateDesignTokens } from '@/lib/design-token-export';

const SCALE_LABELS: Record<string, string> = {
  traditional: 'Traditional',
  custom: 'Custom Ratio',
};

export function CodeExport() {
  const levels = useComputedScale();
  const spacingTokens = useComputedSpacing();
  const store = useTypeStore();
  const [tab, setTab] = useState('css');

  const isGolden = store.scaleMode === 'custom' && store.customRatio === 1.272;
  const scaleLabel = isGolden
    ? '√φ Golden Ratio (area-based) — standby.design/type'
    : `${SCALE_LABELS[store.scaleMode] ?? store.scaleMode} (${store.customRatio}) — standby.design/type`;

  const opts = useMemo(
    () => ({
      levels,
      spacingTokens,
      headingFont: store.headingFont,
      bodyFont: store.bodyFont,
      monoFont: store.monoFont,
      scaleLabel,
    }),
    [levels, spacingTokens, store.headingFont, store.bodyFont, store.monoFont, scaleLabel],
  );

  const cssCode = useMemo(() => generateCssExport(opts), [opts]);
  const twCode = useMemo(() => generateTailwindV4Export(opts), [opts]);
  const dtCode = useMemo(
    () => generateDesignTokens({
      levels,
      spacingTokens,
      headingFont: store.headingFont,
      bodyFont: store.bodyFont,
      monoFont: store.monoFont,
      headingWeight: store.headingWeight,
    }),
    [levels, spacingTokens, store.headingFont, store.bodyFont, store.monoFont, store.headingWeight],
  );
  const embedCode = useMemo(
    () => generateFontEmbed(store.headingFont, store.bodyFont, store.monoFont),
    [store.headingFont, store.bodyFont, store.monoFont],
  );

  const copy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).then(() => toast('Copied!'));
    },
    [],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">Code export</h2>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="css" className="text-xs">
            CSS Custom Properties
          </TabsTrigger>
          <TabsTrigger value="tw4" className="text-xs">
            Tailwind v4
          </TabsTrigger>
          <TabsTrigger value="dt" className="text-xs">
            Design Tokens
          </TabsTrigger>
          <TabsTrigger value="embed" className="text-xs">
            Fontshare Embed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="css">
          <CodeBlock code={cssCode} onCopy={() => copy(cssCode)} />
        </TabsContent>
        <TabsContent value="tw4">
          <CodeBlock code={twCode} onCopy={() => copy(twCode)} />
        </TabsContent>
        <TabsContent value="dt">
          <CodeBlock code={dtCode} onCopy={() => copy(dtCode)} />
        </TabsContent>
        <TabsContent value="embed">
          <CodeBlock code={embedCode} onCopy={() => copy(embedCode)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CodeBlock({
  code,
  onCopy,
}: {
  code: string;
  onCopy: () => void;
}) {
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onCopy}
        className="absolute top-2 right-2 h-7 w-7 p-0 z-10 bg-background/80 backdrop-blur-sm"
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
      <pre className="bg-background rounded-md p-4 pr-10 overflow-auto max-h-80 text-xs font-mono leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
}
