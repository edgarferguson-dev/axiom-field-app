import { Brain, Headphones, LineChart } from "lucide-react";

const CARDS = [
  {
    icon: Brain,
    title: "Pre-call intelligence",
    body: "Structured context before you walk in—so discovery stays sharp and relevant.",
  },
  {
    icon: Headphones,
    title: "Live coaching",
    body: "In-the-moment prompts aligned to buyer signals, without breaking your flow.",
  },
  {
    icon: LineChart,
    title: "Performance debrief",
    body: "Objective scoring and takeaways after the call—so improvement compounds.",
  },
] as const;

export function SystemOverview() {
  return (
    <section
      id="platform-overview"
      className="mx-auto max-w-5xl px-4 py-16 md:py-20"
      aria-labelledby="platform-overview-heading"
    >
      <div className="mb-10 text-center md:text-left">
        <h2
          id="platform-overview-heading"
          className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
        >
          Built for the full revenue moment
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
          Three connected layers—intel, execution, and review—so every session
          compounds into a repeatable field motion.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ icon: Icon, title, body }) => (
          <li key={title}>
            <article className="flex h-full flex-col rounded-2xl border border-border bg-card/60 p-6 shadow-soft transition hover:border-accent/25 hover:bg-card">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
