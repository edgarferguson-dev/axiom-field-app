type ScoutStageHeaderProps = {
  kicker: string;
  title: string;
  description: string;
};

export function ScoutStageHeader({ kicker, title, description }: ScoutStageHeaderProps) {
  return (
    <header className="mb-8 space-y-3 sm:mb-10">
      <p className="proof-phase-eyebrow text-accent">{kicker}</p>
      <h1 className="text-balance text-[1.65rem] font-semibold leading-tight tracking-tight text-foreground sm:text-3xl sm:leading-snug">
        {title}
      </h1>
      <p className="max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base">{description}</p>
    </header>
  );
}
