import { SetSelector } from '@/components/set-selector';
import { SizingControls } from '@/components/controls/sizing-controls';

export function SymbolControls() {
  return (
    <div className="space-y-3">
      <SetSelector />

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        <div className="p-3">
          <SizingControls />
        </div>
      </div>
    </div>
  );
}
