import { useSpaceStore } from '@/store/space-store';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { formatAspect, aspectValue } from '@core/aspect';
import { Trash2 } from 'lucide-react';

export function AspectControls() {
  const {
    aspectRatios, aspectIncludeReciprocals,
    setAspectRatio, removeAspectRatio, setAspectIncludeReciprocals,
  } = useSpaceStore();

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        {aspectRatios.map((a) => (
          <div key={a.name} className="flex items-center gap-2">
            <span className="font-mono text-caption w-20">{a.name}</span>
            <Input
              type="number"
              step={0.001}
              value={a.w}
              onChange={(e) => setAspectRatio(a.name, parseFloat(e.target.value) || 1, a.h)}
              className="h-7 w-20 font-mono text-caption px-1.5 rounded-sm"
            />
            <span className="text-caption text-muted-foreground">:</span>
            <Input
              type="number"
              step={0.001}
              value={a.h}
              onChange={(e) => setAspectRatio(a.name, a.w, parseFloat(e.target.value) || 1)}
              className="h-7 w-20 font-mono text-caption px-1.5 rounded-sm"
            />
            <span className="text-caption text-muted-foreground font-mono min-w-[5rem]">
              ({formatAspect(a)} = {aspectValue(a).toFixed(3)})
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => removeAspectRatio(a.name)}
              className="ml-auto"
              aria-label={`Remove ${a.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <label htmlFor="reciprocals" className="text-caption font-medium cursor-pointer">
          Include portrait variants
        </label>
        <Switch
          id="reciprocals"
          checked={aspectIncludeReciprocals}
          onCheckedChange={setAspectIncludeReciprocals}
        />
      </div>
      <p className="text-caption text-muted-foreground">
        Exports additional <code className="text-caption">-portrait</code> tokens (e.g. <code className="text-caption">video-portrait</code> = 9 / 16).
      </p>
    </div>
  );
}
