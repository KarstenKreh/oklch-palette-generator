import type { QaToolSuite } from './types';

export const shapeCases: QaToolSuite = {
  toolKey: 's',
  toolRoute: '/shape',
  toolName: 'Shape Token Generator',
  accentClass: 'tool-card--shape',
  cases: [
    {
      label: 'Default — Paper',
      note: 'Baseline — paper style with standard shadows, border width 1, radius 8, ring width 2.',
      hash: 'paper,1,normal,100,100,1272,a,,1,10,a,,8,10,20,4,2,2,a,,shadow,0,0,o',
    },
    {
      label: 'Glass max distortion',
      note: 'Glass style with max depth and dispersion. Watch for chromatic edge artifacts, backdrop-filter fallback on unsupported browsers.',
      hash: 'glass,1,normal,100,100,1272,a,,1,10,a,,20,10,20,10,5,5,a,,shadow,0,0,o',
    },
    {
      label: 'Neobrutalism offset',
      note: 'Brutal style with shadow offset — preview should show hard edge shadow, no blur.',
      hash: 'neobrutalism,1,flat,100,0,1272,a,,1,20,a,,4,0,0,0,2,2,a,,shadow,6,6,o',
    },
  ],
};
