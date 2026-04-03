import { useState, useRef, useCallback, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { hexToRgb, rgbToHsv, hsvToRgb, rgbToHsl, hslToRgb } from '@/lib/color-math';

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)); }
function rgbToHex255(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

interface ColorPickerProps {
  value: string; // hex with #
  onChange: (hex: string) => void;
  children: React.ReactNode;
}

export function ColorPicker({ value, onChange, children }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [h, setH] = useState(0);
  const [s, setS] = useState(0);
  const [v, setV] = useState(1);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  // Sync internal HSV from prop when popover opens
  useEffect(() => {
    if (open) {
      const [r, g, b] = hexToRgb(value);
      const [ch, cs, cv] = rgbToHsv(r, g, b);
      setH(ch); setS(cs); setV(cv);
    }
  }, [open, value]);

  const emitColor = useCallback((ch: number, cs: number, cv: number) => {
    const [r, g, b] = hsvToRgb(ch, cs, cv);
    onChange(rgbToHex255(r, g, b));
  }, [onChange]);

  const handleSvPointer = useCallback((e: React.PointerEvent) => {
    const rect = svRef.current!.getBoundingClientRect();
    const ns = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const nv = 1 - clamp((e.clientY - rect.top) / rect.height, 0, 1);
    setS(ns); setV(nv);
    emitColor(h, ns, nv);
  }, [h, emitColor]);

  const handleHuePointer = useCallback((e: React.PointerEvent) => {
    const rect = hueRef.current!.getBoundingClientRect();
    const nh = clamp((e.clientY - rect.top) / rect.height, 0, 1) * 360;
    setH(nh);
    emitColor(nh, s, v);
  }, [s, v, emitColor]);

  const currentHex = rgbToHex255(...hsvToRgb(h, s, v));
  const [hsl_h, hsl_s, hsl_l] = rgbToHsl(...hsvToRgb(h, s, v));
  const [rgb_r, rgb_g, rgb_b] = hsvToRgb(h, s, v);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="flex gap-2 mb-3">
          {/* SV Area — padding-bottom trick guarantees a perfect square */}
          <div className="flex-1 min-w-0">
            <div className="relative w-full" style={{ paddingBottom: '100%' }}>
              <div
                ref={svRef}
                className="absolute inset-0 rounded cursor-crosshair select-none"
                style={{
                  background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h}, 100%, 50%))`,
                }}
                onPointerDown={(e) => { e.preventDefault(); svRef.current!.setPointerCapture(e.pointerId); handleSvPointer(e); }}
                onPointerMove={(e) => { if (svRef.current!.hasPointerCapture(e.pointerId)) handleSvPointer(e); }}
              >
                <div
                  className="absolute w-3.5 h-3.5 rounded-full border-2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    left: `${s * 100}%`,
                    top: `${(1 - v) * 100}%`,
                    borderColor: v > 0.6 && s < 0.4 ? '#333' : '#fff',
                  }}
                />
              </div>
            </div>
          </div>
          {/* Hue Bar */}
          <div
            ref={hueRef}
            className="relative w-4 rounded cursor-pointer select-none"
            style={{
              background: 'linear-gradient(to bottom, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
            }}
            onPointerDown={(e) => { e.preventDefault(); hueRef.current!.setPointerCapture(e.pointerId); handleHuePointer(e); }}
            onPointerMove={(e) => { if (hueRef.current!.hasPointerCapture(e.pointerId)) handleHuePointer(e); }}
          >
            <div
              className="absolute w-full h-2 -translate-y-1/2 rounded border border-white/80 pointer-events-none"
              style={{ top: `${(h / 360) * 100}%`, backgroundColor: `hsl(${h}, 100%, 50%)` }}
            />
          </div>
        </div>

        {/* Preview + Hex */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-sm border border-border" style={{ backgroundColor: currentHex }} />
          <Input
            value={currentHex}
            className="font-mono text-caption h-8 rounded-sm"
            maxLength={7}
            onChange={(e) => {
              const raw = e.target.value.replace(/#/g, '');
              if (/^[0-9a-fA-F]{6}$/.test(raw)) {
                const [r, g, b] = hexToRgb('#' + raw);
                const [nh, ns, nv] = rgbToHsv(r, g, b);
                setH(nh); setS(ns); setV(nv);
                onChange('#' + raw.toUpperCase());
              }
            }}
          />
        </div>

        {/* Mode Tabs */}
        <Tabs defaultValue="hsl">
          <TabsList className="h-8 w-full">
            <TabsTrigger value="hsl" className="text-caption h-7">HSL</TabsTrigger>
            <TabsTrigger value="rgb" className="text-caption h-7">RGB</TabsTrigger>
          </TabsList>
          <TabsContent value="hsl" className="mt-2">
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'H', val: Math.round(hsl_h), max: 360 },
                { label: 'S', val: Math.round(hsl_s * 100), max: 100 },
                { label: 'L', val: Math.round(hsl_l * 100), max: 100 },
              ].map(({ label, val, max }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-caption text-muted-foreground">{label}</span>
                  <Input
                    type="number"
                    min={0}
                    max={max}
                    value={val}
                    className="h-7 text-caption font-mono rounded-sm"
                    onChange={(e) => {
                      const inputs = {
                        H: label === 'H' ? clamp(parseInt(e.target.value) || 0, 0, 360) : Math.round(hsl_h),
                        S: label === 'S' ? clamp(parseInt(e.target.value) || 0, 0, 100) : Math.round(hsl_s * 100),
                        L: label === 'L' ? clamp(parseInt(e.target.value) || 0, 0, 100) : Math.round(hsl_l * 100),
                      };
                      const [nr, ng, nb] = hslToRgb(inputs.H, inputs.S / 100, inputs.L / 100);
                      const [nh, ns, nv] = rgbToHsv(nr, ng, nb);
                      setH(nh); setS(ns); setV(nv);
                      emitColor(nh, ns, nv);
                    }}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="rgb" className="mt-2">
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'R', val: rgb_r },
                { label: 'G', val: rgb_g },
                { label: 'B', val: rgb_b },
              ].map(({ label, val }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-caption text-muted-foreground">{label}</span>
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    value={val}
                    className="h-7 text-caption font-mono rounded-sm"
                    onChange={(e) => {
                      const cv = clamp(parseInt(e.target.value) || 0, 0, 255);
                      const nr = label === 'R' ? cv : rgb_r;
                      const ng = label === 'G' ? cv : rgb_g;
                      const nb = label === 'B' ? cv : rgb_b;
                      const [nh, ns, nv] = rgbToHsv(nr, ng, nb);
                      setH(nh); setS(ns); setV(nv);
                      emitColor(nh, ns, nv);
                    }}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
