import { useShapeStore } from '@/store/shape-store';
import { StyleSelector } from '@/components/style-selector';
import { ShadowControls } from '@/components/controls/shadow-controls';
import { BorderControls } from '@/components/controls/border-controls';
import { RadiusControls } from '@/components/controls/radius-controls';
import { RingControls } from '@/components/controls/ring-controls';
import { GlassControls } from '@/components/controls/glass-controls';
import { BrutalistShadowControls } from '@/components/controls/brutalist-shadow-controls';

export function ShapeControls() {
  const shapeStyle = useShapeStore((s) => s.shapeStyle);

  return (
    <div className="space-y-3">
      <StyleSelector />

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {shapeStyle === 'paper' && (
          <>
            <div className="p-3"><ShadowControls /></div>
            <div className="p-3"><BorderControls /></div>
            <div className="p-3"><RadiusControls /></div>
            <div className="p-3"><RingControls /></div>
          </>
        )}

        {shapeStyle === 'glass' && (
          <>
            <div className="p-3"><GlassControls /></div>
            <div className="p-3"><RadiusControls /></div>
            <div className="p-3"><RingControls /></div>
          </>
        )}

        {shapeStyle === 'neomorph' && (
          <>
            <div className="p-3"><ShadowControls /></div>
            <div className="p-3"><BorderControls /></div>
            <div className="p-3"><RadiusControls /></div>
            <div className="p-3"><RingControls /></div>
          </>
        )}

        {shapeStyle === 'neobrutalism' && (
          <>
            <div className="p-3"><BrutalistShadowControls /></div>
            <div className="p-3"><BorderControls /></div>
            <div className="p-3"><RadiusControls /></div>
            <div className="p-3"><RingControls /></div>
          </>
        )}
      </div>
    </div>
  );
}
