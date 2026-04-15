/**
 * Re-export of shared space code-export generators from @core.
 * Keeps imports stable for space-react components.
 */

export {
  generateSpaceCss as generateCssExport,
  generateSpaceTailwind as generateTailwindV4Export,
  generateSpaceLlmBriefing as generateLlmBriefing,
  type SpaceExportOptions as ExportOptions,
} from '@core/space-code-export';
