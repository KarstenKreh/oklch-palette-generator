/**
 * Shared types for the hidden QA gallery at /qa.
 *
 * Each tool contributes a QaToolSuite with a list of edge-case hashes.
 * The gallery renders each case in an iframe so visual regressions stand out.
 */

export type ToolKey = 'c' | 't' | 's' | 'y' | 'p' | 'system';

export interface QaCase {
  /** Short human label shown above the iframe. */
  label: string;
  /** What the reviewer should look for. Rendered as a caption below the label. */
  note?: string;
  /**
   * Raw tool-segment hash WITHOUT the `#` or `<key>=` prefix.
   * The gallery wraps it as `#<toolKey>=<hash>` before setting iframe src.
   *
   * For system cases: the full unified hash body, e.g. `c=...&t=...&s=...`.
   */
  hash: string;
  /** Optional opt-in invariant check. If present, the gallery renders PASS/FAIL. */
  assert?: (hash: string) => boolean;
}

export interface QaToolSuite {
  toolKey: ToolKey;
  /** Route under which the tool is reachable, e.g. `/color`. */
  toolRoute: string;
  /** Human-readable tool name for the section heading. */
  toolName: string;
  /** Matches the `.tool-card--<name>` accent class from index.html. */
  accentClass: string;
  cases: QaCase[];
}
