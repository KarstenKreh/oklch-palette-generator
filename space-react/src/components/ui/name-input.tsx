import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

/**
 * Editable name field. Commits on blur (or Enter) if the new value is non-empty,
 * different from the current, and doesn't collide with another existing name.
 */
export function NameInput({
  value,
  existing,
  onCommit,
  widthClass = 'w-24',
}: {
  value: string;
  existing: string[];
  onCommit: (next: string) => void;
  widthClass?: string;
}) {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const commit = () => {
    const next = text.trim();
    if (!next || next === value) {
      setText(value);
      return;
    }
    if (existing.includes(next) && next !== value) {
      setText(value);
      return;
    }
    onCommit(next);
  };

  return (
    <Input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        if (e.key === 'Escape') {
          setText(value);
          (e.target as HTMLInputElement).blur();
        }
      }}
      className={`h-7 ${widthClass} font-mono text-caption px-1.5 rounded-sm`}
    />
  );
}
