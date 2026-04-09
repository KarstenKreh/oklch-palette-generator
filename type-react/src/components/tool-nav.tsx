import { Home, Palette, Type, Box, Layers } from 'lucide-react';

type Tool = 'home' | 'system' | 'color' | 'type' | 'shape';

interface ToolNavProps {
  activeTool: Tool;
  buildHash: () => string;
}

const DEV_PORTS: Record<string, number> = { color: 5177, type: 5174, system: 5175, shape: 5176 };

function toolUrl(key: Tool): string {
  if (key === 'home') return import.meta.env.DEV ? 'https://standby.design/' : '/';
  if (import.meta.env.DEV) {
    return `http://localhost:${DEV_PORTS[key]}/${key}/`;
  }
  return `/${key}/`;
}

const tools: { key: Tool; label: string; icon: typeof Palette }[] = [
  { key: 'color', label: 'Color', icon: Palette },
  { key: 'type', label: 'Type', icon: Type },
  { key: 'shape', label: 'Shape', icon: Box },
];

function NavLink({ tool, activeTool, buildHash, className }: {
  tool: { key: Tool; label: string; icon: typeof Palette };
  activeTool: Tool;
  buildHash: () => string;
  className?: string;
}) {
  const isActive = tool.key === activeTool;
  return (
    <a
      href={isActive ? undefined : `${toolUrl(tool.key)}#${buildHash()}`}
      className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-[10px] font-medium transition-colors ${
        isActive
          ? 'bg-muted text-foreground'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      } ${className || ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <tool.icon className="size-4" />
      {tool.label}
    </a>
  );
}

/** Desktop: vertical sidebar. Mobile: fixed bottom bar. */
export function ToolNav({ activeTool, buildHash }: ToolNavProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-14 shrink-0 pt-1">
        {/* Home */}
        <a
          href={toolUrl('home')}
          className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-[10px] font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors mb-1"
        >
          <Home className="size-4" />
          Home
        </a>

        {/* Divider */}
        <div className="h-px bg-border mx-2 mb-1" />

        {/* Tools */}
        <div className="flex flex-col gap-1 flex-1">
          {tools.map((tool) => (
            <NavLink key={tool.key} tool={tool} activeTool={activeTool} buildHash={buildHash} />
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-border mx-2 my-1" />

        {/* System — bottom CTA */}
        <NavLink
          tool={{ key: 'system', label: 'System', icon: Layers }}
          activeTool={activeTool}
          buildHash={buildHash}
        />
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center bg-background/95 backdrop-blur border-t border-border px-2 py-1 safe-bottom">
        {tools.map((tool) => (
          <NavLink key={tool.key} tool={tool} activeTool={activeTool} buildHash={buildHash} className="flex-1 max-w-[72px]" />
        ))}
        <NavLink
          tool={{ key: 'system', label: 'System', icon: Layers }}
          activeTool={activeTool}
          buildHash={buildHash}
          className="flex-1 max-w-[72px]"
        />
      </nav>
    </>
  );
}
