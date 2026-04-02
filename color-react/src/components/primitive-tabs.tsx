import { usePalette } from '@/hooks/use-palette';
import { useThemeStore } from '@/store/theme-store';
import { PaletteTable } from '@/components/palette-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PrimitiveTabs() {
  const { brand, surface, error, errorSurface, neutralExtended, slated, accentPalettes } =
    usePalette();
  const chromaScale = useThemeStore((s) => s.chromaScale);
  const chromaPct = Math.round(chromaScale * 100);

  const tabKeys = [
    'brand',
    'error',
    ...accentPalettes.map((_, i) => `accent-${i}`),
    'neutral',
  ];

  return (
    <Tabs defaultValue="brand">
      <TabsList className="flex-wrap">
        <TabsTrigger value="brand">Brand</TabsTrigger>
        <TabsTrigger value="error">Error</TabsTrigger>
        {accentPalettes.map((accent, i) => (
          <TabsTrigger key={tabKeys[i + 2]} value={`accent-${i}`}>
            {accent.name}
          </TabsTrigger>
        ))}
        <TabsTrigger value="neutral">Neutral</TabsTrigger>
      </TabsList>

      {/* Brand */}
      <TabsContent value="brand">
        <PaletteSubTabs
          actionLabel="Brand"
          actionDesc="Full chroma — buttons, switches, checkboxes, interactive elements"
          surfaceDesc={`Surfaces \u00B7 containers — ${chromaPct}% chroma`}
          actionPalette={brand}
          surfacePalette={slated}
        />
      </TabsContent>

      {/* Error */}
      <TabsContent value="error">
        <PaletteSubTabs
          actionLabel="Error"
          actionDesc="Full chroma — destructive actions, alerts, validation states"
          surfaceDesc={`Error surface palette — ${chromaPct}% chroma`}
          actionPalette={error}
          surfacePalette={errorSurface}
        />
      </TabsContent>

      {/* Accent palettes */}
      {accentPalettes.map((accent, i) => (
        <TabsContent key={`accent-${i}`} value={`accent-${i}`}>
          <PaletteSubTabs
            actionLabel={accent.name}
            actionDesc={`Full chroma — ${accent.name} interactive elements`}
            surfaceDesc={`${accent.name} surface palette — ${chromaPct}% chroma`}
            actionPalette={accent.palette}
            surfacePalette={accent.slatedPalette}
          />
        </TabsContent>
      ))}

      {/* Neutral */}
      <TabsContent value="neutral">
        <p className="mb-3 text-sm text-muted-foreground">
          0% chroma — High Contrast surfaces &middot; #fff and #000 included
        </p>
        <PaletteTable palette={neutralExtended} showWhiteBlack />
      </TabsContent>
    </Tabs>
  );
}

interface PaletteSubTabsProps {
  actionLabel: string;
  actionDesc: string;
  surfaceDesc: string;
  actionPalette: import('@/lib/palette').PaletteEntry[];
  surfacePalette: import('@/lib/palette').PaletteEntry[];
}

function PaletteSubTabs({
  actionLabel,
  actionDesc,
  surfaceDesc,
  actionPalette,
  surfacePalette,
}: PaletteSubTabsProps) {
  return (
    <Tabs defaultValue="action">
      <TabsList>
        <TabsTrigger value="action">{actionLabel}</TabsTrigger>
        <TabsTrigger value="surface">Surface</TabsTrigger>
      </TabsList>

      <TabsContent value="action">
        <p className="mb-3 text-sm text-muted-foreground">{actionDesc}</p>
        <PaletteTable palette={actionPalette} />
      </TabsContent>

      <TabsContent value="surface">
        <p className="mb-3 text-sm text-muted-foreground">{surfaceDesc}</p>
        <PaletteTable palette={surfacePalette} />
      </TabsContent>
    </Tabs>
  );
}
