import { usePalette } from '@/hooks/use-palette';
import { useThemeStore } from '@/store/theme-store';
import { SurfacePanel } from '@/components/surface-panel';
import type { PaletteEntry } from '@core/palette';

function toLookup(palette: PaletteEntry[]): Record<number, PaletteEntry> {
  const map: Record<number, PaletteEntry> = {};
  for (const entry of palette) {
    map[entry.step as number] = entry;
  }
  return map;
}

export interface ShapeTokens {
  borderEnabled: boolean;
  borderWidth: number;
  borderRadius: number;
}

export function SurfacePreview({ shapeTokens }: { shapeTokens?: ShapeTokens }) {
  const {
    brand,
    surface,
    error,
    errorSurface,
    neutral,
    neutralExtended,
    accentPalettes,
    brandSwatchOverride,
    errorSwatchOverride,
  } = usePalette();

  const fgContrastMode = useThemeStore((s) => s.fgContrastMode);
  const brandInvert = useThemeStore((s) => s.brandInvert);
  const errorInvert = useThemeStore((s) => s.errorInvert);

  const brandMap = toLookup(brand);
  const surfaceMap = toLookup(surface);
  const errorMap = toLookup(error);
  const errorSurfaceMap = toLookup(errorSurface);
  const neutralMap = toLookup(neutralExtended);

  const shared = {
    brand: brandMap,
    error: errorMap,
    errorSurface: errorSurfaceMap,
    neutral: neutralMap,
    brandSwatchOverride,
    brandInvert,
    errorSwatchOverride,
    errorInvert,
    accentPalettes,
    fgContrastMode,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SurfacePanel panelType="light" palette={surfaceMap} {...shared} shapeTokens={shapeTokens} />
      <SurfacePanel panelType="dark" palette={surfaceMap} {...shared} shapeTokens={shapeTokens} />
      <SurfacePanel panelType="light-hc" palette={surfaceMap} {...shared} shapeTokens={shapeTokens} />
      <SurfacePanel panelType="dark-hc" palette={surfaceMap} {...shared} shapeTokens={shapeTokens} />
    </div>
  );
}
