import type { QaToolSuite } from './types';

/**
 * System cases carry a full unified hash body (c=...&t=...&s=...&y=...&p=...).
 * The `toolKey: 'system'` tells the gallery NOT to prefix the hash when building iframe src.
 */
export const systemCases: QaToolSuite = {
  toolKey: 'system',
  toolRoute: '/system',
  toolName: 'Design System Viewer',
  accentClass: 'tool-card--system',
  cases: [
    {
      label: 'Default combined',
      note: 'All tools at their defaults, merged. Baseline for the system merger.',
      hash: 'c=335A7F,335A7F,1,CC3333,1,25,balanced,1,1,best,Standby.Design,0,0&t=custom,1,1.272,1.2,satoshi,satoshi,system-mono&s=paper,1,normal,100,100,1272,a,,1,10,a,,8,10,20,4,2,2,a,,shadow,0,0,o&y=a,a,a,125,1272,1,&p=harmonic,1000,1272,100,1',
    },
    {
      label: 'Cross-tool extremes',
      note: 'White brand + phi ratio + glass + max icons + geometric 2.0 spacing all combined. Verify merged export stays well-formed with no token collisions.',
      hash: 'c=FFFFFF,FFFFFF,1,000000,0,100,balanced,1,1,best,Combined%20Edge,0,0&t=custom,1,1.618,1.3,satoshi,satoshi,system-mono&s=glass,1,normal,100,100,1272,a,,1,10,a,,20,10,20,10,5,5,a,,shadow,0,0,o&y=f,b,n,300,2000,0,phosphor-bold&p=geometric,1000,2000,100,1',
    },
  ],
};
