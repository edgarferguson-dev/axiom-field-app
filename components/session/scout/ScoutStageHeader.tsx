type ScoutStageHeaderProps = {
  kicker: string;
  title: string;
  description: string;
};

export function ScoutStageHeader({ kicker, title, description }: ScoutStageHeaderProps) {
  return (
    <header className="mb-16 space-y-3">
      <p className="ax-label">{kicker}</p>
      <h1 className="ax-h1 text-balance">{title}</h1>
      <p className="max-w-2xl text-base text-muted">{description}</p>
    </header>
  );
}
