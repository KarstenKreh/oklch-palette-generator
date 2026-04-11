import { useTypeStore } from '@/store/type-store';
import { FontSelector } from '@/components/font-selector';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DEFAULT_TRADITIONAL, DEFAULT_TRADITIONAL_MOBILE } from '@core/scale';
import type { ScaleMode } from '@/store/type-store';
import { TraditionalAssignments } from './scale-controls/traditional-assignments';
import { HeadingWeightControls } from './scale-controls/heading-weight-controls';
import { TypographyDetails } from './scale-controls/typography-details';
import { RatioSliderV2, HintWithStory } from './scale-controls/ratio-slider-v2';
import { BaseInputV2 } from './scale-controls/base-input-v2';
import { MobileRatioSliderV2 } from './scale-controls/mobile-ratio-slider-v2';

export function ScaleControls() {
  const store = useTypeStore();

  return (
    <div className="space-y-8">
      {/* Scale Mode */}
      <div className="space-y-2">
        <h3 className="text-body-s font-semibold text-foreground">Scale mode</h3>
        <Tabs value={store.scaleMode} onValueChange={(v) => store.setScaleMode(v as ScaleMode)}>
          <TabsList className="w-full">
            <TabsTrigger value="custom" className="text-caption">
              Ratio
            </TabsTrigger>
            <TabsTrigger value="traditional" className="text-caption">
              Traditional
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Scale controls */}
      {store.scaleMode === 'custom' && (
        <div className="space-y-2">
          <h3 className="text-body-s font-semibold text-foreground">Scale</h3>
          <HintWithStory hint="Ratios between 1.20 and 1.50 produce clear visual hierarchy. The default (1.272) balances contrast with cohesion." />
          <div className="border border-border rounded-sm divide-y divide-border">
            {/* Desktop */}
            <div className="p-3 space-y-2">
              <BaseInputV2 label="Desktop" value={store.baseSize} onChange={store.setBaseSize} />
              <RatioSliderV2
                value={store.customRatio}
                onChange={store.setCustomRatio}
              />
            </div>
            {/* Mobile */}
            <div className="p-3 space-y-2">
              <BaseInputV2 label="Mobile" value={store.mobileBaseSize} onChange={store.setMobileBaseSize} />
              <MobileRatioSliderV2 />
            </div>
          </div>
        </div>
      )}

      {store.scaleMode === 'traditional' && (
        <TraditionalAssignments
          assignments={store.traditionalAssignments}
          mobileAssignments={store.traditionalMobileAssignments}
          onAssign={store.setTraditionalAssignment}
          onMobileAssign={store.setTraditionalMobileAssignment}
          onReset={() => store.setFullState({
            traditionalAssignments: { ...DEFAULT_TRADITIONAL },
            traditionalMobileAssignments: { ...DEFAULT_TRADITIONAL_MOBILE },
          })}
        />
      )}

      {/* Font Selection */}
      <div className="space-y-2">
        <h3 className="text-body-s font-semibold text-foreground">Fonts</h3>
        <FontSelector
          label="Heading"
          value={store.headingFont}
          onChange={store.setHeadingFont}
        />
        <FontSelector
          label="Body"
          value={store.bodyFont}
          onChange={store.setBodyFont}
        />
        <FontSelector
          label="Mono"
          value={store.monoFont}
          onChange={store.setMonoFont}
          categories={['mono']}
        />
      </div>

      {/* Typography Details */}
      <TypographyDetails />

      {/* Heading Weight */}
      <HeadingWeightControls />
    </div>
  );
}
