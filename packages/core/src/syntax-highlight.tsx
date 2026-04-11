import type { ReactNode } from 'react';

export type HighlightMode = 'css' | 'markdown' | 'json' | 'html';

export function highlightCss(code: string): ReactNode {
  return code.split('\n').map((line, i) => {
    if (line.trim().startsWith('/*')) {
      return <span key={i} className="text-muted-foreground/60">{line}{'\n'}</span>;
    }
    const match = line.match(/^(\s*)(--[\w-]+)(:\s*)(.+)(;)$/);
    if (match) {
      return (
        <span key={i}>
          {match[1]}<span className="text-sky-400">{match[2]}</span>{match[3]}<span className="text-orange-300">{match[4]}</span>{match[5]}{'\n'}
        </span>
      );
    }
    return <span key={i}>{line}{'\n'}</span>;
  });
}

export function highlightMarkdown(code: string): ReactNode {
  return code.split('\n').map((line, i) => {
    if (line.startsWith('# '))
      return <span key={i} className="text-foreground font-bold text-caption">{line}{'\n'}</span>;
    if (line.startsWith('## '))
      return <span key={i} className="text-foreground font-semibold text-caption">{line}{'\n'}</span>;
    if (line.startsWith('### '))
      return <span key={i} className="text-muted-foreground font-semibold">{line}{'\n'}</span>;
    if (line.startsWith('|'))
      return <span key={i} className="text-sky-400/80">{line}{'\n'}</span>;
    if (line.startsWith('- '))
      return <span key={i} className="text-orange-300/80">{line}{'\n'}</span>;
    if (line.match(/^\d+\./))
      return <span key={i} className="text-orange-300/80">{line}{'\n'}</span>;
    return <span key={i}>{line}{'\n'}</span>;
  });
}

export function highlightJson(code: string): ReactNode {
  return code.split('\n').map((line, i) => {
    // Keys: "key":
    const keyMatch = line.match(/^(\s*)("[\w$.-]+")(:\s*)(.*)$/);
    if (keyMatch) {
      const val = keyMatch[4];
      return (
        <span key={i}>
          {keyMatch[1]}<span className="text-sky-400">{keyMatch[2]}</span>{keyMatch[3]}<span className="text-orange-300">{val}</span>{'\n'}
        </span>
      );
    }
    return <span key={i}>{line}{'\n'}</span>;
  });
}

export function highlightHtml(code: string): ReactNode {
  return code.split('\n').map((line, i) => {
    if (line.trim().startsWith('<!--')) {
      return <span key={i} className="text-muted-foreground/60">{line}{'\n'}</span>;
    }
    // Highlight tag names and attributes
    const parts: ReactNode[] = [];
    let rest = line;
    let partKey = 0;
    const tagRe = /(<\/?)(\w+)|(\w+)(=)("[^"]*")/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = tagRe.exec(rest)) !== null) {
      if (m.index > last) parts.push(rest.slice(last, m.index));
      if (m[2]) {
        // Tag: <tag or </tag
        parts.push(<span key={partKey++} className="text-sky-400">{m[1]}{m[2]}</span>);
      } else if (m[3]) {
        // Attribute: attr="value"
        parts.push(<span key={partKey++} className="text-orange-300/80">{m[3]}</span>);
        parts.push(m[4]);
        parts.push(<span key={partKey++} className="text-emerald-400/80">{m[5]}</span>);
      }
      last = m.index + m[0].length;
    }
    if (last < rest.length) parts.push(rest.slice(last));
    return <span key={i}>{parts}{'\n'}</span>;
  });
}

export function highlight(code: string, mode: HighlightMode): ReactNode {
  switch (mode) {
    case 'css': return highlightCss(code);
    case 'markdown': return highlightMarkdown(code);
    case 'json': return highlightJson(code);
    case 'html': return highlightHtml(code);
  }
}
