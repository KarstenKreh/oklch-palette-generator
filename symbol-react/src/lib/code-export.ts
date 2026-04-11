/**
 * Code export generators for icon tokens.
 * Generates CSS custom properties, Tailwind v4, DTCG JSON, and LLM briefing.
 */

import { computeIconTokens, weightToStroke, type IconTokens } from '@core/icon-tokens';
import { ICON_SETS, getSetById, type IconSetDefinition } from '@core/icon-sets';
import { recommendSets, type SymbolPreferences } from '@core/recommend';

interface ExportInput {
  iconBaseSize: number;
  iconScale: number;
  selectedSet: string | null;
  prefs: SymbolPreferences;
}

function getTopSet(input: ExportInput): IconSetDefinition {
  if (input.selectedSet) return getSetById(input.selectedSet) || ICON_SETS[0];
  const results = recommendSets(input.prefs);
  return results[0]?.set || ICON_SETS[0];
}

function getTokens(input: ExportInput): { tokens: IconTokens; set: IconSetDefinition } {
  const set = getTopSet(input);
  const tokens = computeIconTokens(input.iconBaseSize, input.iconScale, weightToStroke(set.strokeWeight));
  return { tokens, set };
}

export function generateCss(input: ExportInput): string {
  const { tokens, set } = getTokens(input);
  const lines = [
    `/* Icon Tokens — standby.design/symbol */`,
    `/* Recommended: ${set.name} (${set.id}) */`,
    `:root {`,
    ...tokens.sizes.map((s) => `  --icon-${s.name}: ${s.rem}rem;`),
    `  --icon-stroke: ${tokens.strokeWidth}px;`,
    `}`,
  ];
  return lines.join('\n');
}

export function generateTailwind(input: ExportInput): string {
  const { tokens, set } = getTokens(input);
  const lines = [
    `/* Icon Tokens — standby.design/symbol */`,
    `/* Recommended: ${set.name} (${set.id}) */`,
    `@theme {`,
    ...tokens.sizes.map((s) => `  --icon-${s.name}: ${s.rem}rem;`),
    `  --icon-stroke: ${tokens.strokeWidth}px;`,
    `}`,
  ];
  return lines.join('\n');
}

export function generateDtcg(input: ExportInput): string {
  const { tokens, set } = getTokens(input);
  const obj: Record<string, unknown> = {
    icon: {
      $description: `Icon tokens — recommended set: ${set.name} (${set.id})`,
      size: Object.fromEntries(
        tokens.sizes.map((s) => [s.name, { $type: 'dimension', $value: `${s.rem}rem` }])
      ),
      stroke: { $type: 'dimension', $value: `${tokens.strokeWidth}px` },
    },
  };
  return JSON.stringify(obj, null, 2);
}

export function generateLlmBriefing(input: ExportInput): string {
  const { tokens, set } = getTokens(input);
  const allResults = recommendSets(input.prefs);

  const lines = [
    `# Icon System — standby.design/symbol`,
    ``,
    `## Recommended Set`,
    ``,
    `**${set.name}** — ${set.description}`,
    ``,
    `- Style: ${set.style}`,
    `- Weight: ${set.strokeWeight}`,
    `- Corners: ${set.cornerStyle}`,
    `- License: ${set.license}`,
    `- Install: \`npm install ${set.npmPackage}\``,
    `- Browse: ${set.url}`,
    `- Iconify prefix: \`${set.iconifyPrefix}\``,
    ``,
    `## Sizing Tokens`,
    ``,
    `| Token | Value | Use Case |`,
    `|-------|-------|----------|`,
    ...tokens.sizes.map((s) => `| --icon-${s.name} | ${s.rem}rem (${s.px}px) | ${s.useCase} |`),
    `| --icon-stroke | ${tokens.strokeWidth}px | Stroke width |`,
    ``,
    `## Alternatives`,
    ``,
    ...allResults.map((r, i) => `${i + 1}. **${r.set.name}** (${Math.round(r.score * 100)}%) — ${r.set.description}`),
    ``,
    `## Usage Guidelines`,
    ``,
    `- Use \`--icon-md\` (${tokens.sizes[2].px}px) as the default size for UI icons`,
    `- Use \`--icon-sm\` for inline icons next to body text`,
    `- Use \`--icon-lg\` for primary navigation and action buttons`,
    `- Maintain consistent stroke width of ${tokens.strokeWidth}px across all icons`,
    `- Stick to a single icon set for visual consistency`,
  ];

  return lines.join('\n');
}
