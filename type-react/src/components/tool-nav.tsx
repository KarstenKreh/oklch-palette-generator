import { Home, Palette, Type, LayoutGrid, Box } from 'lucide-react';

type Tool = 'home' | 'system' | 'color' | 'type' | 'shape';

interface ToolNavProps {
  activeTool: Tool;
  buildHash: () => string;
}

const DEV_PORTS: Record<string, number> = { color: 5173, type: 5174, system: 5175, shape: 5176 };

function toolUrl(key: Tool): string {
  if (key === 'home') return import.meta.env.DEV ? 'https://standby.design/' : '/';
  if (import.meta.env.DEV) {
    return `http://localhost:${DEV_PORTS[key]}/${key}/`;
  }
  return `/${key}/`;
}

const tools: { key: Tool; label: string; icon: typeof Palette; hasHash: boolean }[] = [
  { key: 'home', label: 'Home', icon: Home, hasHash: false },
  { key: 'system', label: 'System', icon: LayoutGrid, hasHash: true },
  { key: 'color', label: 'Color', icon: Palette, hasHash: true },
  { key: 'type', label: 'Type', icon: Type, hasHash: true },
  { key: 'shape', label: 'Shape', icon: Box, hasHash: true },
];

function NavItems({ activeTool, buildHash, className }: ToolNavProps & { className?: string }) {
  return (
    <>
      {tools.map(({ key, label, icon: Icon, hasHash }) => {
        const isActive = key === activeTool;
        const hash = hasHash ? `#${buildHash()}` : '';
        return (
          <a
            key={key}
            href={isActive ? undefined : `${toolUrl(key)}${hash}`}
            className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-[10px] font-medium transition-colors ${
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            } ${className || ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="size-4" />
            {label}
          </a>
        );
      })}
    </>
  );
}

/** Desktop: vertical sidebar. Mobile: fixed bottom bar. */
export function ToolNav({ activeTool, buildHash }: ToolNavProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col gap-1 w-14 shrink-0 pt-1">
        <NavItems activeTool={activeTool} buildHash={buildHash} />
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center bg-background/95 backdrop-blur border-t border-border px-2 py-1 safe-bottom">
        <NavItems activeTool={activeTool} buildHash={buildHash} className="flex-1 max-w-[72px]" />
      </nav>
    </>
  );
}
