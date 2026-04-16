import type { QaToolSuite } from './types';

export const symbolCases: QaToolSuite = {
  toolKey: 'y',
  toolRoute: '/symbol',
  toolName: 'Icon Style Recommender',
  accentClass: 'tool-card--symbol',
  cases: [
    {
      label: 'Default',
      note: 'Baseline — auto preferences, baseSize 1.25rem, scale 1.272.',
      hash: 'a,a,a,125,1272,1,',
    },
    {
      label: 'Min size + min scale',
      note: 'Smallest icons at lowest scale. Snap to 4px on — verify nothing collapses to 0.',
      hash: 'a,a,a,50,1000,1,',
    },
    {
      label: 'Max size + max scale, snap off',
      note: 'Largest icons with fractional sizes. Verify no 4px-grid clipping, pre-selected Phosphor Bold.',
      hash: 'f,b,n,300,2000,0,phosphor-bold',
    },
  ],
};
