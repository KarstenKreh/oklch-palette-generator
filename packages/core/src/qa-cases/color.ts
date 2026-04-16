import type { QaToolSuite } from './types';

export const colorCases: QaToolSuite = {
  toolKey: 'c',
  toolRoute: '/color',
  toolName: 'Color Palette Generator',
  accentClass: 'tool-card--color',
  cases: [
    {
      label: 'Default',
      note: 'Baseline — Brand #335A7F, balanced mode, 25% chroma.',
      hash: '335A7F,335A7F,1,CC3333,1,25,balanced,1,1,best,Standby.Design,0,0',
    },
    {
      label: 'Pure white gamut edge',
      note: 'Brand and surface at #FFFFFF, error at #000000. Watch for NaN/infinite lightness and washed-out palette steps.',
      hash: 'FFFFFF,FFFFFF,1,000000,0,100,balanced,1,1,best,White%20Edge,0,0',
    },
    {
      label: 'Emoji in theme name',
      note: 'Theme name with emoji. Verify URL decode, OG injection safety, no layout breakage in exports.',
      hash: '335A7F,335A7F,1,CC3333,1,25,balanced,1,1,best,Name%20%F0%9F%8E%A8,0,0',
    },
  ],
};
