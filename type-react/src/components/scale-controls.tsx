import { useTypeStore } from '@/store/type-store';
import { FontSelector } from '@/components/font-selector';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { DEFAULT_TRADITIONAL, DEFAULT_TRADITIONAL_MOBILE } from '@/lib/scale';
import type { ScaleMode } from '@/store/type-store';
import { BaseInput } from './scale-controls/base-input';
import { RatioSlider } from './scale-controls/ratio-slider';
import { MobileRatioSlider, MOBILE_MODE_OPTIONS } from './scale-controls/mobile-ratio-slider';
import { ModeSwitch } from '@/components/mode-switch';
import type { MobileRatioMode } from '@/store/type-store';
import { TraditionalAssignments } from './scale-controls/traditional-assignments';
import { HeadingWeightControls } from './scale-controls/heading-weight-controls';
import { TypographyDetails } from './scale-controls/typography-details';

export function ScaleControls() {
  const store = useTypeStore();

  return (
    <div className="space-y-8">
      {/* Scale Mode */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Scale mode</h3>
        <Tabs value={store.scaleMode} onValueChange={(v) => store.setScaleMode(v as ScaleMode)}>
          <TabsList className="w-full">
            <TabsTrigger value="custom" className="text-xs">
              Ratio
            </TabsTrigger>
            <TabsTrigger value="traditional" className="text-xs">
              Traditional
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Mode-specific controls */}
      {store.scaleMode === 'custom' && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Scale</h3>
          <div className="border border-border rounded-sm divide-y divide-border">
            {/* Desktop */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <BaseInput label="Desktop" value={store.baseSize} onChange={store.setBaseSize} />
              </div>
              <RatioSlider
                hint="We recommend √φ — it scales the perceived area of type by the golden ratio, resulting in a visually harmonious hierarchy."
                value={store.customRatio}
                onChange={store.setCustomRatio}
              />
            </div>
            {/* Mobile */}
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <BaseInput label="Mobile" value={store.mobileBaseSize} onChange={store.setMobileBaseSize} />
                <ModeSwitch
                  value={store.mobileRatioMode}
                  options={MOBILE_MODE_OPTIONS}
                  onChange={(v) => store.setMobileRatioMode(v as MobileRatioMode)}
                />
              </div>
              <MobileRatioSlider />
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
        <h3 className="text-sm font-semibold text-foreground">Fonts</h3>
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
