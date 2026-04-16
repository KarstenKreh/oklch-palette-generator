import type { QaToolSuite } from './types';
import { colorCases } from './color';
import { typeCases } from './type';
import { shapeCases } from './shape';
import { symbolCases } from './symbol';
import { spaceCases } from './space';
import { systemCases } from './system';

export type { QaCase, QaToolSuite, ToolKey } from './types';

export const allSuites: QaToolSuite[] = [
  colorCases,
  typeCases,
  shapeCases,
  spaceCases,
  symbolCases,
  systemCases,
];
