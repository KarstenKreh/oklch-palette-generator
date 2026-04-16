import type { QaToolSuite } from './types';

export const spaceCases: QaToolSuite = {
  toolKey: 'p',
  toolRoute: '/space',
  toolName: 'Spacing & Layout Generator',
  accentClass: 'tool-card--space',
  cases: [
    {
      label: 'Default',
      note: 'Baseline — harmonic mode, ratio 1.272, default breakpoints and containers.',
      hash: 'harmonic,1000,1272,100,1',
    },
    {
      label: 'Extreme ratio 2.0',
      note: 'Geometric mode at max ratio — spacing steps double. Watch for label wrapping in the table.',
      hash: 'geometric,1000,2000,100,1',
    },
    {
      label: 'Custom breakpoints + prose tight',
      note: 'Extended tail: 5 breakpoints + tight prose container (40ch). Verify the extended-state UI reflects all customizations.',
      hash: 'harmonic,1000,1272,100,1|bp=xs:320;sm:640;md:1024;lg:1280;xl:1920|pch=40',
    },
  ],
};
