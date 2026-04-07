import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useShapeStore } from '@/store/shape-store';
import type { SeparationMode } from '@/store/shape-store';

export function SeparationControls() {
  const { separationMode, setSeparationMode } = useShapeStore();

  return (
    <div className="space-y-3">
      <h3 className="text-body-s font-semibold">Surface Separation</h3>

      <div className="space-y-1">
        <span className="text-caption font-medium text-muted-foreground">Mode</span>
        <ToggleGroup
          type="single"
          value={separationMode}
          onValueChange={(v) => v && setSeparationMode(v as SeparationMode)}
          variant="outline"
          className="justify-start flex-wrap"
        >
          <ToggleGroupItem value="shadow" size="sm" className="text-caption">Shadow</ToggleGroupItem>
          <ToggleGroupItem value="border" size="sm" className="text-caption">Border</ToggleGroupItem>
          <ToggleGroupItem value="contrast" size="sm" className="text-caption">Contrast</ToggleGroupItem>
          <ToggleGroupItem value="gap" size="sm" className="text-caption">Gap</ToggleGroupItem>
          <ToggleGroupItem value="mixed" size="sm" className="text-caption">Mixed</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
