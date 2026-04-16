import { useSpaceStore } from '@/store/space-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NameInput } from '@/components/ui/name-input';
import { sortContainers } from '@core/layout';
import { Trash2, Plus } from 'lucide-react';

const MAX_CONTAINERS = 6;

function nextContainerName(existing: string[]): string {
  for (let i = 1; i < 20; i++) {
    const candidate = `custom-${i}`;
    if (!existing.includes(candidate)) return candidate;
  }
  return `custom-${existing.length + 1}`;
}

export function ContainerControls() {
  const { containers, proseMaxCh, setContainer, renameContainer, removeContainer, addContainer, setProseMaxCh } = useSpaceStore();
  const allNames = containers.map((c) => c.name);
  const sorted = sortContainers(containers);
  const atMax = containers.length >= MAX_CONTAINERS;

  const handleAdd = () => {
    const largest = sorted.length > 0 ? sorted[sorted.length - 1].maxPx : 1200;
    addContainer({
      name: nextContainerName(containers.map((c) => c.name)),
      maxPx: Math.round(largest * 1.272),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-caption font-medium">Containers</label>
          <Button
            variant="outline"
            size="icon"
            onClick={handleAdd}
            disabled={atMax}
            aria-label="Add container"
            className="size-7"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
        <div className="space-y-1.5">
          {sorted.map((c) => (
            <div key={c.name} className="flex items-center gap-2">
              <NameInput
                value={c.name}
                existing={allNames}
                onCommit={(next) => renameContainer(c.name, next)}
                widthClass="w-24"
              />
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
