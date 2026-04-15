import { useSpaceStore } from '@/store/space-store';
import { sortBreakpoints } from '@core/layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function BreakpointTable() {
  const breakpoints = useSpaceStore((s) => s.breakpoints);
  const sorted = sortBreakpoints(breakpoints);
  const max = Math.max(...sorted.map((b) => b.minPx), 1920);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead>Min Width</TableHead>
          <TableHead className="w-full">Coverage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((b) => (
          <TableRow key={b.name}>
            <TableCell className="font-mono text-caption">--breakpoint-{b.name}</TableCell>
            <TableCell className="font-mono text-caption">{b.minPx}px</TableCell>
            <TableCell>
              <div className="relative h-2 bg-muted rounded-sm overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-primary/60"
                  style={{ width: `${((max - b.minPx) / max) * 100}%`, left: `${(b.minPx / max) * 100}%` }}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
