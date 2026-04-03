import { useCallback } from 'react';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import { useComputedScale } from '@/hooks/use-computed-scale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function ScaleTable() {
  const scale = useComputedScale();

  const copyValue = useCallback((value: string) => {
    navigator.clipboard.writeText(value).then(() => toast('Copied!'));
  }, []);

  return (
    <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Level</TableHead>
          <TableHead className="w-24">Min</TableHead>
          <TableHead className="w-24">Max</TableHead>
          <TableHead>CSS Value</TableHead>
          <TableHead className="w-16">Leading</TableHead>
          <TableHead className="w-20">Tracking</TableHead>
          <TableHead className="w-16 text-right">Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scale.map((l) => (
          <TableRow
            key={l.level}
            className="group cursor-pointer hover:bg-muted/50"
            onClick={() => copyValue(l.clampValue)}
            title="Click to copy"
          >
            <TableCell className="font-medium text-caption">
              {l.label}
            </TableCell>
            <TableCell className="font-mono text-caption text-muted-foreground">
              {l.minRem}rem
              <span className="ml-1.5 text-muted-foreground/50">
                {Math.round(l.minRem * 16)}px
              </span>
            </TableCell>
            <TableCell className="font-mono text-caption text-muted-foreground">
              {l.maxRem}rem
              <span className="ml-1.5 text-muted-foreground/50">
                {Math.round(l.maxRem * 16)}px
              </span>
            </TableCell>
            <TableCell className="font-mono text-caption break-all">
              <span className="flex items-center gap-1.5">
                {l.clampValue}
                <Copy className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors shrink-0" />
              </span>
            </TableCell>
            <TableCell className="font-mono text-caption text-muted-foreground">
              {l.lineHeight}
            </TableCell>
            <TableCell className="font-mono text-caption text-muted-foreground">
              {l.letterSpacing === 0 ? '0' : `${l.letterSpacing}em`}
            </TableCell>
            <TableCell className="text-right">
              {l.isFluid ? (
                <Badge variant="secondary" className="text-caption">
                  fluid
                </Badge>
              ) : (
                <Badge variant="outline" className="text-caption">
                  fixed
                </Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  );
}
