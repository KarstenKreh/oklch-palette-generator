import { useComputedSpacing } from '@/hooks/use-computed-spacing';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function SpacingTable() {
  const tokens = useComputedSpacing();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Token</TableHead>
          <TableHead className="w-20">Multiple</TableHead>
          <TableHead className="w-24">Size</TableHead>
          <TableHead>Preview</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tokens.map((t) => (
          <TableRow key={t.name}>
            <TableCell className="font-mono text-xs">
              --space-{t.name}
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {t.multiple}×
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {t.rem}rem
              <span className="ml-1.5 text-muted-foreground/50">
                {t.px}px
              </span>
            </TableCell>
            <TableCell>
              <div
                className="bg-primary/20 rounded-sm h-3"
                style={{ width: `${t.rem}rem` }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
