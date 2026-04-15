import { useSpaceStore } from '@/store/space-store';
import { sortContainers } from '@core/layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function ContainerTable() {
  const containers = useSpaceStore((s) => s.containers);
  const sorted = sortContainers(containers);
  const max = Math.max(...sorted.map((c) => c.maxPx), 1920);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead>Max Width</TableHead>
          <TableHead className="w-full">Width</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((c) => (
          <TableRow key={c.name}>
            <TableCell className="font-mono text-caption">--container-{c.name}</TableCell>
            <TableCell className="font-mono text-caption">{c.maxPx}px</TableCell>
            <TableCell>
              <div
                className="h-2 bg-primary/60 rounded-sm"
                style={{ width: `${(c.maxPx / max) * 100}%` }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
