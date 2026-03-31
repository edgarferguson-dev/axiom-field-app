type TopbarProps = {
  title?: string;
  subtitle?: string;
  status?: string;
};

export function Topbar({
  title = "Axiom Flow",
  subtitle = "Guided Sales Execution",
  status = "Phase 1 Build",
}: TopbarProps) {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="space-y-1">
          <div className="text-lg font-semibold tracking-tight">{title}</div>
          <div className="text-sm text-muted">{subtitle}</div>
        </div>

        <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted">
          {status}
        </div>
      </div>
    </header>
  );
}
