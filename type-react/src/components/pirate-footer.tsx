export function PirateFooter() {
  return (
    <footer className="flex items-center justify-center gap-2 py-8 text-caption text-muted-foreground">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[1.8em] h-[1.8em]"
      >
        <circle cx="12" cy="10" r="7" />
        <circle cx="9.5" cy="9" r="1.5" />
        <circle cx="14.5" cy="9" r="1.5" />
        <path d="M10 13.5c0 0 1 1.5 2 1.5s2-1.5 2-1.5" />
        <path d="M12 17v3" />
        <path d="M8 22l4-2 4 2" />
        <path d="M5 18l3-1" />
        <path d="M19 18l-3-1" />
      </svg>
      No copyright — take what you need, make it yours.
    </footer>
  );
}
