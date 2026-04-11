import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { PaletteEntry } from '@core/palette';
import type { AccentPalette } from '@/lib/color-code-export';

interface PaletteResult {
  brand: PaletteEntry[];
  surface: PaletteEntry[];
  error: PaletteEntry[];
  neutral: PaletteEntry[];
  accentPalettes: AccentPalette[];
  brandSwatchOverride: { hex: string; L: number } | null;
  errorSwatchOverride: { hex: string; L: number } | null;
}

/* ─── helpers ─── */

function p(pal: PaletteEntry[], step: number): string {
  return pal.find(e => e.step === step)?.hex || '#888';
}

/** Pick readable foreground (white or dark) for a given background hex */
function fgFor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? '#000000' : '#FFFFFF';
}

/* ─── Role definitions ─── */

interface ColorRole {
  label: string;
  description: string;
  hex: string;
  fg: string;
}

function buildRoles(palette: PaletteResult): ColorRole[] {
  const roles: ColorRole[] = [];

  // Brand — primary color (use pinned hex when available)
  const brandHex = palette.brandSwatchOverride?.hex || p(palette.brand, 500);
  roles.push({
    label: 'Brand',
    description: 'Your primary color — buttons, links, and accents.',
    hex: brandHex,
    fg: fgFor(brandHex),
  });

  // Surface Light
  const surfaceLightHex = p(palette.surface, 50);
  roles.push({
    label: 'Surface',
    description: 'Page and card backgrounds in light mode.',
    hex: surfaceLightHex,
    fg: fgFor(surfaceLightHex),
  });

  // Surface Dark
  const surfaceDarkHex = p(palette.surface, 875);
  roles.push({
    label: 'Surface Dark',
    description: 'Page and card backgrounds in dark mode.',
    hex: surfaceDarkHex,
    fg: fgFor(surfaceDarkHex),
  });

  // Error (use pinned hex when available)
  const errorHex = palette.errorSwatchOverride?.hex || p(palette.error, 500);
  roles.push({
    label: 'Error',
    description: 'Errors, warnings, and destructive actions.',
    hex: errorHex,
    fg: fgFor(errorHex),
  });

  // Accent colors (use pinned hex when available)
  for (const accent of palette.accentPalettes) {
    const accentHex = accent.pin ? accent.hex : p(accent.palette, 500);
    const descriptions: Record<string, string> = {
      success: 'Positive feedback — confirmations and completed states.',
      warning: 'Caution — states that need attention.',
      info: 'Neutral hints — tips and informational messages.',
    };
    roles.push({
      label: accent.name,
      description: descriptions[accent.cssName] || `Accent color for ${accent.name.toLowerCase()} elements.`,
      hex: accentHex,
      fg: fgFor(accentHex),
    });
  }

  return roles;
}

/* ─── Color Swatch Card ─── */

function ColorCard({ role }: { role: ColorRole }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border">
      {/* Color swatch */}
      <div
        className="h-20 flex items-end p-2.5"
        style={{ backgroundColor: role.hex }}
      >
        <span
          className="text-xs font-mono opacity-80"
          style={{ color: role.fg }}
        >
          {role.hex.toUpperCase()}
        </span>
      </div>
      {/* Label + description */}
      <div className="px-2.5 py-2 bg-background flex-1">
        <div className="text-sm font-medium text-foreground">{role.label}</div>
        <div className="text-xs text-muted-foreground leading-snug mt-0.5">
          {role.description}
        </div>
      </div>
    </div>
  );
}

/* ─── Full Palette Strip (for expandable section) ─── */

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

/* ─── Main Export ─── */

export function ColorSummary({ palette }: { palette: PaletteResult }) {
  const [showFull, setShowFull] = useState(false);
  const roles = buildRoles(palette);

  return (
    <div className="space-y-4">
      {/* Intro text */}
      <p className="text-sm text-muted-foreground">
        The key colors of your design system. Each color has a specific role in your UI.
      </p>

      {/* Semantic Color Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {roles.map((role) => (
          <ColorCard key={role.label} role={role} />
        ))}
      </div>

      {/* Expandable Full Palette */}
      <div>
        <button
          onClick={() => setShowFull(!showFull)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ChevronDown
            size={14}
            className="transition-transform"
            style={{ transform: showFull ? 'rotate(180deg)' : undefined }}
          />
          {showFull ? 'Hide' : 'Show'} full palette
        </button>

        {showFull && (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              All 18 steps from light to dark — the complete scale for building components.
            </p>
            <PaletteStrip label="Brand" palette={palette.brand} />
            <PaletteStrip label="Surface" palette={palette.surface} />
            <PaletteStrip label="Error" palette={palette.error} />
            <PaletteStrip label="Neutral" palette={palette.neutral} />
            {palette.accentPalettes.map((accent) => (
              <PaletteStrip key={accent.name} label={accent.name} palette={accent.palette} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
