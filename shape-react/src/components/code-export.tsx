import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useShapeStore } from '@/store/shape-store';
import {
  generateCssExport,
  generateTailwindV4Export,
  generateDesignTokensExport,
  generateLlmBriefing,
  type ShapeExportOptions,
} from '@/lib/code-export';

export function CodeExport() {
  const store = useShapeStore();
  const [tab, setTab] = useState('css');

  const opts: ShapeExportOptions = useMemo(
    () => ({
      shapeStyle: store.shapeStyle,
      shadowEnabled: store.shadowEnabled,
      shadowType: store.shadowType,
      shadowStrength: store.shadowStrength,
      shadowBlurScale: store.shadowBlurScale,
      shadowScale: store.shadowScale,
      shadowColorMode: store.shadowColorMode,
      shadowCustomColor: store.shadowCustomColor,
      borderEnabled: store.borderEnabled,
      borderWidth: store.borderWidth,
      borderRadius: store.borderRadius,
      glassDepth: store.glassDepth,
      glassBlur: store.glassBlur,
      glassDispersion: store.glassDispersion,
      ringWidth: store.ringWidth,
      ringOffset: store.ringOffset,
      separationMode: store.separationMode,
      surfaceHex: store.surfaceHex,
    }),
    [
      store.shapeStyle, store.shadowEnabled, store.shadowType, store.shadowStrength,
      store.shadowBlurScale, store.shadowScale, store.shadowColorMode,
      store.shadowCustomColor, store.borderEnabled, store.borderWidth,
      store.borderRadius, store.glassDepth,
      store.glassBlur, store.glassDispersion, store.ringWidth, store.ringOffset,
      store.separationMode, store.surfaceHex,
    ],
  );

  const cssCode = useMemo(() => generateCssExport(opts), [opts]);
  const twCode = useMemo(() => generateTailwindV4Export(opts), [opts]);
  const dtCode = useMemo(() => generateDesignTokensExport(opts), [opts]);
  const llmCode = useMemo(() => generateLlmBriefing(opts), [opts]);

  const copy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).then(() => toast('Copied!'));
    },
    [],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-body-s font-semibold">Code export</h2>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="css" className="text-caption">
            CSS Custom Properties
          </TabsTrigger>
          <TabsTrigger value="tw4" className="text-caption">
            Tailwind v4
          </TabsTrigger>
          <TabsTrigger value="dt" className="text-caption">
            Design Tokens
          </TabsTrigger>
          <TabsTrigger value="llm" className="text-caption">
            LLM Briefing
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
        <TabsContent value="llm">
          <CodeBlock code={llmCode} onCopy={() => copy(llmCode)} />
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
      <pre className="bg-background border border-border rounded-md p-4 pr-10 overflow-auto max-h-80 text-caption font-mono leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
}
