import type { QaToolSuite } from './types';

export const typeCases: QaToolSuite = {
  toolKey: 't',
  toolRoute: '/type',
  toolName: 'Type Scale Generator',
  accentClass: 'tool-card--type',
  cases: [
    {
      label: 'Default',
      note: 'Baseline — custom ratio 1.272, baseSize 1rem, Satoshi.',
      hash: 'custom,1,1.272,1.2,satoshi,satoshi,system-mono',
    },
    {
      label: 'Tight ratio 1.067',
      note: 'Minor second — lowest slider value. Headings should barely differ from body.',
      hash: 'custom,1,1.067,1.067,satoshi,satoshi,system-mono',
    },
    {
      label: 'Phi ratio 1.618',
      note: 'Golden ratio — highest slider value. Display size becomes huge; watch for mobile overflow and clamp slope.',
      hash: 'custom,1,1.618,1.3,satoshi,satoshi,system-mono',
    },
  ],
};
