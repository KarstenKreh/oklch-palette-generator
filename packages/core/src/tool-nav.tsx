import type { ReactNode } from 'react';

type Tool = 'home' | 'system' | 'color' | 'type' | 'shape' | 'symbol';

interface ToolNavProps {
  activeTool: Tool;
  buildHash: () => string;
}

const DEV_PORTS: Record<string, number> = { color: 5177, type: 5174, system: 5175, shape: 5176, symbol: 5178 };

function toolUrl(key: Tool): string {
  if (key === 'home') return '/';
  if (import.meta.env.DEV) {
    return `http://localhost:${DEV_PORTS[key]}/${key}/`;
  }
  return `/${key}/`;
}

/** Inline Lucide icons so @core doesn't pull lucide-react into rollup resolution */
function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </Icon>
  );
}

function PaletteIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    </Icon>
  );
}

function TypeIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M12 4v16" />
      <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
      <path d="M9 20h6" />
    </Icon>
  );
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </Icon>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </Icon>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
      <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
      <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
    </Icon>
  );
}

type IconComponent = (props: { className?: string }) => ReactNode;

const tools: { key: Tool; label: string; icon: IconComponent }[] = [
  { key: 'color', label: 'Color', icon: PaletteIcon },
  { key: 'shape', label: 'Shape', icon: BoxIcon },
  { key: 'symbol', label: 'Symbol', icon: StarIcon },
  { key: 'type', label: 'Type', icon: TypeIcon },
];

function NavLink({ tool, activeTool, buildHash, className }: {
  tool: { key: Tool; label: string; icon: IconComponent };
  activeTool: Tool;
  buildHash: () => string;
  className?: string;
}) {
  const isActive = tool.key === activeTool;
  const IconComp = tool.icon;
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
      <IconComp className="size-4" />
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
          <HomeIcon className="size-4" />
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
          tool={{ key: 'system', label: 'System', icon: LayersIcon }}
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
          tool={{ key: 'system', label: 'System', icon: LayersIcon }}
          activeTool={activeTool}
          buildHash={buildHash}
          className="flex-1 max-w-[72px]"
        />
      </nav>
    </>
  );
}
