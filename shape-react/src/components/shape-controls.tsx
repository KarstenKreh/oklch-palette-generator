import { ShadowControls } from '@/components/controls/shadow-controls';
import { BorderControls } from '@/components/controls/border-controls';
import { RadiusControls } from '@/components/controls/radius-controls';
import { RingControls } from '@/components/controls/ring-controls';

export function ShapeControls() {
  return (
    <div className="bg-card border border-border rounded-lg divide-y divide-border">
      <div className="p-3"><ShadowControls /></div>
      <div className="p-3"><BorderControls /></div>
      <div className="p-3"><RadiusControls /></div>
      <div className="p-3"><RingControls /></div>
    </div>
  );
}
