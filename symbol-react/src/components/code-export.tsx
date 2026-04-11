import { useMemo, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useSymbolStore } from '@/store/symbol-store';
import { generateCss, generateTailwind, generateDtcg, generateLlmBriefing } from '@/lib/code-export';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

export function CodeExport() {
  const {
    iconBaseSize, iconScale, selectedSet,
    preferredStyle, preferredWeight, preferredCorners,
  } = useSymbolStore();
  const [activeTab, setActiveTab] = useState('css');

  const input = useMemo(() => ({
    iconBaseSize,
    iconScale,
    selectedSet,
    prefs: { style: preferredStyle, mood: 50, weight: preferredWeight, corners: preferredCorners },
  }), [iconBaseSize, iconScale, selectedSet, preferredStyle, preferredWeight, preferredCorners]);

  const css = useMemo(() => generateCss(input), [input]);
  const tailwind = useMemo(() => generateTailwind(input), [input]);
  const dtcg = useMemo(() => generateDtcg(input), [input]);
  const llm = useMemo(() => generateLlmBriefing(input), [input]);

  const codeMap: Record<string, string> = { css, tailwind, dtcg, llm };

  const handleCopy = useCallback(() => {
    const code = codeMap[activeTab];
    if (code) navigator.clipboard.writeText(code).then(() => toast('Copied!'));
  }, [activeTab, codeMap]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-body-s font-semibold">Export</h3>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="size-3.5 mr-1.5" />
          Copy
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="tailwind">Tailwind v4</TabsTrigger>
          <TabsTrigger value="dtcg">Design Tokens</TabsTrigger>
          <TabsTrigger value="llm">LLM Briefing</TabsTrigger>
        </TabsList>
        {(['css', 'tailwind', 'dtcg', 'llm'] as const).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-caption font-mono leading-relaxed">
              <code>{codeMap[tab]}</code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
