import { useSpaceStore } from '@/store/space-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { sortContainers } from '@core/layout';
import { Trash2 } from 'lucide-react';

export function ContainerControls() {
  const { containers, proseMaxCh, setContainer, removeContainer, setProseMaxCh } = useSpaceStore();
  const sorted = sortContainers(containers);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-caption font-medium mb-1.5 block">Containers</label>
        <div className="space-y-1.5">
          {sorted.map((c) => (
            <div key={c.name} className="flex items-center gap-2">
              <span className="font-mono text-caption w-20">{c.name}</span>
              <Input
                type="number"
                value={c.maxPx}
                onChange={(e) => setContainer(c.name, parseInt(e.target.value) || 0)}
                className="h-7 w-24 font-mono text-caption px-1.5 rounded-sm"
              />
              <span className="text-caption text-muted-foreground">px</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeContainer(c.name)}
                className="ml-auto"
                aria-label={`Remove ${c.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border">
        <label className="text-caption font-medium mb-1.5 block">
          Prose reading column: <span className="font-mono text-muted-foreground">{proseMaxCh}ch</span>
        </label>
        <Input
          type="number"
          value={proseMaxCh}
          onChange={(e) => setProseMaxCh(parseInt(e.target.value) || 65)}
          className="h-7 w-24 font-mono text-caption px-1.5 rounded-sm"
        />
        <p className="text-caption text-muted-foreground mt-1.5">
          Typical reading column is 45–75ch. 65 is a common default for articles.
        </p>
      </div>
    </div>
  );
}
