import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy } from 'lucide-react';
import { useSymbolStore } from '@/store/symbol-store';
import { generateCss, generateTailwind, generateDtcg, generateLlmBriefing } from '@/lib/code-export';
import { CodeBlock } from '@/components/code-block';

export function CodeExport() {
  const {
    iconBaseSize, iconScale, snapTo4px, selectedSet,
    preferredStyle, preferredWeight, preferredCorners,
  } = useSymbolStore();
  const [tab, setTab] = useState('css');

  const [copyFormat, setCopyFormat] = useState<'css' | 'tw4'>('css');
  const [copyDt, setCopyDt] = useState(true);
  const [copyLlm, setCopyLlm] = useState(true);

  const input = useMemo(() => ({
    iconBaseSize,
    iconScale,
    snapTo4px,
    selectedSet,
    prefs: { style: preferredStyle, mood: 50, weight: preferredWeight, corners: preferredCorners },
  }), [iconBaseSize, iconScale, snapTo4px, selectedSet, preferredStyle, preferredWeight, preferredCorners]);

  const cssCode = useMemo(() => generateCss(input), [input]);
  const twCode = useMemo(() => generateTailwind(input), [input]);
  const dtCode = useMemo(() => generateDtcg(input), [input]);
  const llmCode = useMemo(() => generateLlmBriefing(input), [input]);

  const handleCopyAll = useCallback(() => {
    const parts: string[] = [];
    parts.push(copyFormat === 'css' ? cssCode : twCode);
    if (copyDt) parts.push(dtCode);
    if (copyLlm) parts.push(llmCode);
    const combined = parts.join('\n\n');
    navigator.clipboard.writeText(combined).then(() => toast('All selected sections copied!'));
  }, [copyFormat, copyDt, copyLlm, cssCode, twCode, dtCode, llmCode]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-body-s font-semibold">Code export</h2>
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
                    variant={copyFormat === 'tw4' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-7 text-caption"
                    onClick={() => setCopyFormat('tw4')}
                  >
                    Tailwind
                  </Button>
                </div>
              </div>

              <div className="border-t border-border pt-2 space-y-2">
                <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wider">Include</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={copyDt} onCheckedChange={(v) => setCopyDt(!!v)} />
                  <span className="text-caption">Design Tokens</span>
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
          <CodeBlock code={cssCode} mode="css" />
        </TabsContent>
        <TabsContent value="tw4">
          <CodeBlock code={twCode} mode="css" />
        </TabsContent>
        <TabsContent value="dt">
          <CodeBlock code={dtCode} mode="json" />
        </TabsContent>
        <TabsContent value="llm">
          <CodeBlock code={llmCode} mode="markdown" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
