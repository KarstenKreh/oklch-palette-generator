import './styles.css';
import { allSuites } from '@core/qa-cases';
import type { QaCase, QaToolSuite } from '@core/qa-cases';

const SUITE_CLASS: Record<QaToolSuite['toolKey'], string> = {
  c: 'suite--color',
  t: 'suite--type',
  s: 'suite--shape',
  y: 'suite--symbol',
  p: 'suite--space',
  system: 'suite--system',
};

// In dev, each tool lives on its own Vite port. Bypass dev-hub and hit the tool directly
// so the gallery works regardless of which dev-hub version is running.
// Must stay in sync with dev-hub.js TOOL_PORTS.
const DEV_TOOL_PORTS: Record<string, number> = {
  '/color': 5177,
  '/type': 5174,
  '/shape': 5176,
  '/symbol': 5178,
  '/space': 5179,
  '/system': 5175,
};

function toolBase(route: string): string {
  if (!import.meta.env.DEV) return route;
  const port = DEV_TOOL_PORTS[route];
  return port ? `http://localhost:${port}${route}` : route;
}

function buildIframeSrc(suite: QaToolSuite, c: QaCase): string {
  const base = toolBase(suite.toolRoute);
  if (suite.toolKey === 'system') {
    return `${base}/#${c.hash}`;
  }
  return `${base}/#${suite.toolKey}=${c.hash}`;
}

function caseElement(suite: QaToolSuite, c: QaCase): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'case';

  const head = document.createElement('div');
  head.className = 'case-head';

  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = c.label;
  head.appendChild(label);

  if (c.note) {
    const note = document.createElement('div');
    note.className = 'note';
    note.textContent = c.note;
    head.appendChild(note);
  }

  const src = buildIframeSrc(suite, c);
  const hash = document.createElement('div');
  hash.className = 'hash';
  const link = document.createElement('a');
  link.href = src;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = src;
  hash.appendChild(link);
  head.appendChild(hash);

  wrapper.appendChild(head);

  const iframe = document.createElement('iframe');
  iframe.className = 'case-frame';
  iframe.src = src;
  iframe.loading = 'lazy';
  iframe.title = `${suite.toolName} — ${c.label}`;
  wrapper.appendChild(iframe);

  return wrapper;
}

function suiteElement(suite: QaToolSuite): HTMLElement {
  const details = document.createElement('details');
  details.className = `suite ${SUITE_CLASS[suite.toolKey]}`;
  details.open = true;

  const summary = document.createElement('summary');

  const dot = document.createElement('span');
  dot.className = 'accent-dot';
  summary.appendChild(dot);

  const heading = document.createElement('h2');
  heading.textContent = suite.toolName;
  summary.appendChild(heading);

  const route = document.createElement('span');
  route.className = 'route';
  route.textContent = suite.toolRoute;
  summary.appendChild(route);

  const count = document.createElement('span');
  count.className = 'count';
  count.textContent = `${suite.cases.length} case${suite.cases.length === 1 ? '' : 's'}`;
  summary.appendChild(count);

  details.appendChild(summary);

  const grid = document.createElement('div');
  grid.className = 'grid';
  for (const c of suite.cases) {
    grid.appendChild(caseElement(suite, c));
  }
  details.appendChild(grid);

  return details;
}

function render(): void {
  const root = document.getElementById('root');
  if (!root) throw new Error('#root not found');

  const header = document.createElement('header');
  header.className = 'page-header';

  const h1 = document.createElement('h1');
  h1.textContent = 'QA Gallery';
  header.appendChild(h1);

  const warn = document.createElement('div');
  warn.className = 'warn-banner';
  warn.textContent = 'noindex — not linked from the hub. Internal use only.';
  header.appendChild(warn);

  const totalCases = allSuites.reduce((n, s) => n + s.cases.length, 0);
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `${allSuites.length} tools · ${totalCases} cases. Collapse a section to free iframe memory.`;
  header.appendChild(meta);

  root.appendChild(header);
  for (const suite of allSuites) {
    root.appendChild(suiteElement(suite));
  }
}

render();
