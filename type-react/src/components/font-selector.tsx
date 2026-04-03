import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronsUpDown, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFontEntry, loadFont, type FontEntry } from '@/lib/fontshare';
import { useFontCatalog } from '@/hooks/use-font-loader';

interface FontSelectorProps {
  label: string;
  value: string; // slug
  onChange: (slug: string) => void;
  /** Restrict to these categories (e.g. ['mono'] for mono selector) */
  categories?: FontEntry['category'][];
}

const CATEGORY_LABELS: Record<string, string> = {
  sans: 'Sans Serif',
  serif: 'Serif',
  display: 'Display',
  mono: 'Monospace',
};
const CATEGORY_ORDER: Record<string, number> = { sans: 0, serif: 1, display: 2, mono: 3 };

export function FontSelector({ label, value, onChange, categories }: FontSelectorProps) {
  const allFonts = useFontCatalog();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter by allowed categories, then by search query
  const available = useMemo(() => {
    if (!categories) return allFonts;
    return allFonts.filter((f) => categories.includes(f.category));
  }, [allFonts, categories]);

  const filtered = useMemo(() => {
    if (!query) return available;
    const q = query.toLowerCase();
    return available.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q),
    );
  }, [available, query]);

  // Group for display
  const grouped = useMemo(() => {
    const groups: Record<string, FontEntry[]> = {};
    for (const f of filtered) {
      (groups[f.category] ??= []).push(f);
    }
    return Object.entries(groups).sort(
      ([a], [b]) => (CATEGORY_ORDER[a] ?? 99) - (CATEGORY_ORDER[b] ?? 99),
    );
  }, [filtered]);

  // Reset highlight on filter change
  useEffect(() => {
    setHighlightIdx(0);
  }, [query]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${highlightIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightIdx, open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const select = useCallback(
    (slug: string) => {
      onChange(slug);
      setQuery('');
      setOpen(false);
      inputRef.current?.blur();
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightIdx((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filtered[highlightIdx]) {
            select(filtered[highlightIdx].slug);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          break;
      }
    },
    [open, filtered, highlightIdx, select],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      if (!open) setOpen(true);
    },
    [open],
  );

  const handleFocus = useCallback(() => {
    setOpen(true);
    setQuery('');
  }, []);

  // Load selected font for display
  const selected = getFontEntry(value);
  useEffect(() => {
    if (selected) loadFont(selected.slug);
  }, [selected]);

  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <div ref={containerRef} className="relative">
        {/* Input trigger */}
        <div
          className={cn(
            'flex items-center gap-1 h-7 w-full rounded-sm border border-input bg-transparent px-2 text-xs transition-colors',
            open && 'border-ring ring-2 ring-ring/50',
          )}
        >
          <input
            ref={inputRef}
            value={open ? query : ''}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={selected?.name ?? 'Select font…'}
            className={cn(
              'flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-0 text-xs',
              !open && selected && 'placeholder:text-foreground',
            )}
            style={
              !open && selected
                ? { fontFamily: `'${selected.name}', ${selected.fallback}` }
                : undefined
            }
          />
          <ChevronsUpDown className="size-3 text-muted-foreground shrink-0" />
        </div>

        {/* Dropdown */}
        {open && (
          <div
            ref={listRef}
            className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-md border border-border bg-popover shadow-xl shadow-black/40"
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">No fonts found</div>
            ) : (
              grouped.map(([category, catFonts]) => (
                <div key={category}>
                  <div className="sticky top-0 bg-popover/95 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    {CATEGORY_LABELS[category] ?? category}
                  </div>
                  {catFonts.map((font) => {
                    const idx = filtered.indexOf(font);
                    const isSelected = font.slug === value;
                    return (
                      <button
                        key={font.slug}
                        data-idx={idx}
                        className={cn(
                          'w-full text-left px-3 py-1.5 text-xs cursor-pointer transition-colors flex items-center justify-between',
                          idx === highlightIdx && 'bg-accent text-accent-foreground',
                          isSelected && 'font-semibold',
                        )}
                        onMouseEnter={() => {
                          setHighlightIdx(idx);
                          loadFont(font.slug);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          select(font.slug);
                        }}
                        style={{ fontFamily: `'${font.name}', ${font.fallback}` }}
                      >
                        <span className="truncate">{font.name}</span>
                        {isSelected && <Check className="size-3 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
