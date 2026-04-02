import { toast } from 'sonner';
import type { PaletteEntry } from '@/lib/palette';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PaletteTableProps {
  palette: PaletteEntry[];
  showWhiteBlack?: boolean;
}

function stepZone(step: number): string {
  if (step === 0) return 'White';
  if (step === 1000) return 'Black';
  if (step >= 25 && step <= 100) return 'Light Surface';
  if (step >= 200 && step <= 800) return 'Core';
  if (step >= 825 && step <= 875) return 'Dark Surface';
  if (step >= 900 && step <= 975) return 'High Contrast';
  return '';
}

function copyToClipboard(value: string) {
  navigator.clipboard.writeText(value).then(() => {
    toast('Copied: ' + value);
  });
}

export function PaletteTable({ palette, showWhiteBlack }: PaletteTableProps) {
  const entries = showWhiteBlack
    ? palette
    : palette.filter((e) => (e.step as number) !== 0 && (e.step as number) !== 1000);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs text-muted-foreground">Step</TableHead>
          <TableHead className="text-xs text-muted-foreground">Color</TableHead>
          <TableHead className="text-xs text-muted-foreground">Hex</TableHead>
          <TableHead className="text-xs text-muted-foreground">OKLCH</TableHead>
          <TableHead className="text-xs text-muted-foreground">L</TableHead>
          <TableHead className="text-xs text-muted-foreground">C</TableHead>
          <TableHead className="text-xs text-muted-foreground">Zone</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.step}>
            <TableCell className="text-xs font-mono">{entry.step}</TableCell>
            <TableCell>
              <div
                className="size-6 rounded-sm border border-border"
                style={{ backgroundColor: entry.hex }}
              />
            </TableCell>
            <TableCell
              className="text-xs font-mono cursor-pointer hover:text-foreground text-muted-foreground"
              onClick={() => copyToClipboard(entry.hex)}
            >
              {entry.hex}
            </TableCell>
            <TableCell
              className="text-xs font-mono cursor-pointer hover:text-foreground text-muted-foreground"
              onClick={() => copyToClipboard(entry.css)}
            >
              {entry.css}
            </TableCell>
            <TableCell className="text-xs font-mono">
              {entry.L.toFixed(2)}
            </TableCell>
            <TableCell className="text-xs font-mono">
              {entry.C.toFixed(4)}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {stepZone(entry.step as number)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
