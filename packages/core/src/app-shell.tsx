import { useEffect, type ReactNode } from 'react';
import { ToolNav } from './tool-nav';
import { PirateFooter } from './pirate-footer';

type Tool = 'color' | 'type' | 'shape' | 'symbol' | 'space' | 'system';

interface AppShellProps {
  activeTool: Tool;
  buildHash: () => string;
  children: ReactNode;
  /** Type app needs overflow-x-hidden on content column to contain wide preview */
  overflowXHidden?: boolean;
}

/**
 * Shared shell for all standby.design tools: dark-mode lock, tool nav (desktop + mobile),
 * content column with max-w-7xl, and pirate footer. App-specific content goes in children.
 */
export function AppShell({ activeTool, buildHash, children, overflowXHidden }: AppShellProps) {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const contentCol = `flex-1 min-w-0 pb-16 md:pb-0${overflowXHidden ? ' overflow-x-hidden' : ''}`;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="hidden md:flex sticky top-0 h-screen p-3 border-r border-border">
        <ToolNav activeTool={activeTool} buildHash={buildHash} />
      </div>
      <div className="md:hidden">
        <ToolNav activeTool={activeTool} buildHash={buildHash} />
      </div>
      <div className={contentCol}>
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {children}
        </div>
        <PirateFooter />
      </div>
    </div>
  );
}
