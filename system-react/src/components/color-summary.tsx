import type { PaletteEntry } from '@/lib/palette';
import type { AccentPalette } from '@/lib/color-code-export';

interface PaletteResult {
  brand: PaletteEntry[];
  surface: PaletteEntry[];
  error: PaletteEntry[];
  neutral: PaletteEntry[];
  accentPalettes: AccentPalette[];
}

function PaletteStrip({ label, palette, accent }: { label: string; palette: PaletteEntry[]; accent?: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1" style={{ color: accent }}>{label}</div>
      <div className="flex rounded-lg overflow-hidden h-8">
        {palette.map((entry) => (
          <div
            key={entry.step}
            className="flex-1 relative group"
            style={{ backgroundColor: entry.hex }}
            title={`${entry.step}: ${entry.hex}`}
          />
        ))}
      </div>
    </div>
  );
}

export function ColorSummary({ palette }: { palette: PaletteResult }) {
  return (
    <div className="space-y-3">
      <PaletteStrip label="Brand" palette={palette.brand} />
      <PaletteStrip label="Surface" palette={palette.surface} />
      <PaletteStrip label="Error" palette={palette.error} />
      <PaletteStrip label="Neutral" palette={palette.neutral} />
      {palette.accentPalettes.map((accent) => (
        <PaletteStrip key={accent.name} label={accent.name} palette={accent.palette} />
      ))}
    </div>
  );
}
