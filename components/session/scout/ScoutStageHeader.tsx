type ScoutStageHeaderProps = {
  kicker: string;
  title: string;
  description: string;
};

export function ScoutStageHeader({ kicker, title, description }: ScoutStageHeaderProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{kicker}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
    </div>
  );
}
