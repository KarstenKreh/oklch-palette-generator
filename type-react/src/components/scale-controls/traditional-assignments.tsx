import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw } from 'lucide-react';
import {
  TRADITIONAL_SIZES,
  TYPE_LEVELS,
  LEVEL_LABELS,
  type TypeLevel,
} from '@core/scale';

export function TraditionalAssignments({
  assignments,
  mobileAssignments,
  onAssign,
  onMobileAssign,
  onReset,
}: {
  assignments: Record<TypeLevel, number>;
  mobileAssignments: Record<TypeLevel, number>;
  onAssign: (level: TypeLevel, px: number) => void;
  onMobileAssign: (level: TypeLevel, px: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-body-s font-semibold text-foreground">Size assignments</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-6 w-6 p-0 cursor-pointer"
          title="Reset to defaults"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-caption text-muted-foreground/60 w-12 shrink-0" />
        <span className="text-caption text-muted-foreground/60 flex-1 text-center">Mobile</span>
        <span className="text-caption text-muted-foreground/60 flex-1 text-center">Desktop</span>
      </div>
      <div className="grid grid-cols-1 gap-1">
        {TYPE_LEVELS.map((level) => (
          <div key={level} className="flex items-center gap-1.5">
            <span className="text-caption w-12 shrink-0 text-muted-foreground">
              {LEVEL_LABELS[level]}
            </span>
            <SizeSelect
              value={mobileAssignments[level]}
              onChange={(v) => onMobileAssign(level, v)}
            />
            <SizeSelect
              value={assignments[level]}
              onChange={(v) => onAssign(level, v)}
            />
          </div>
        ))}
      </div>
      <p className="text-caption leading-snug text-muted-foreground">
        Default in most word processors — the classical typographic scale, established in the Renaissance for metal typesetting.
      </p>
    </div>
  );
}

function SizeSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (px: number) => void;
}) {
  return (
    <Select
      value={value.toString()}
      onValueChange={(v) => onChange(parseFloat(v))}
    >
      <SelectTrigger className="h-7 text-caption flex-1 px-1.5 rounded-sm min-w-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TRADITIONAL_SIZES.map((s) => (
          <SelectItem
            key={s.px}
            value={s.px.toString()}
            className="text-caption"
          >
            {s.px}px — {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
