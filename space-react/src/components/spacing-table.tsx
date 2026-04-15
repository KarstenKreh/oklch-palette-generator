import { useComputedSpacing } from '@/hooks/use-computed-spacing';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function SpacingTable() {
  const tokens = useComputedSpacing();
  const maxRem = Math.max(...tokens.map((t) => t.rem), 1);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead>Multiple</TableHead>
          <TableHead>rem</TableHead>
          <TableHead>px</TableHead>
          <TableHead className="w-full">Preview</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tokens.map((t) => (
          <TableRow key={t.name}>
            <TableCell className="font-mono text-caption">--space-{t.name}</TableCell>
            <TableCell className="font-mono text-caption text-muted-foreground">{t.multiple}×</TableCell>
            <TableCell className="font-mono text-caption">{t.rem}</TableCell>
            <TableCell className="font-mono text-caption text-muted-foreground">{t.px}</TableCell>
            <TableCell>
              <div
                className="h-2 bg-primary/60 rounded-sm"
                style={{ width: `${(t.rem / maxRem) * 100}%` }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
