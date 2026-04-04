import { getBeatForSlideType } from "@/lib/presentation/beats";
import type { SlideType } from "@/lib/flows/presentationEngine";

type BeatOneLinersProps = {
  slideType: SlideType;
  /** DaNI public: open layout, headline-scale lines, no dashboard box. */
  variant?: "default" | "dani";
};

/** Buyer-facing: goal + 1–3 short rep lines for the current beat. */
export function BeatOneLiners({ slideType, variant = "default" }: BeatOneLinersProps) {
  const beat = getBeatForSlideType(slideType);
  if (!beat) return null;
  const lines = beat.oneLiners.filter(Boolean) as string[];

  if (variant === "dani") {
    return (
      <div className="mb-8 space-y-4 border-l-[3px] border-accent-dark/60 pl-5 sm:mb-10 sm:pl-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent-dark">
          {beat.id
            .split(/[-_]/g)
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")}
        </p>
        <p className="max-w-3xl text-base font-medium leading-snug text-foreground/85 sm:text-lg">{beat.goal}</p>
        <ul className="space-y-5 sm:space-y-6">
          {lines.map((line, i) => (
            <li
              key={i}
              className="max-w-4xl text-2xl font-semibold leading-[1.25] tracking-tight text-foreground sm:text-3xl md:text-[1.85rem] md:leading-snug"
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-3 rounded-xl border border-accent/25 bg-accent/[0.06] p-4 sm:p-5">
      <p className="ax-label">Establish in this beat</p>
      <p className="text-sm font-medium text-foreground">{beat.goal}</p>
      <ul className="space-y-3 border-t border-border/40 pt-4">
        {lines.map((line, i) => (
          <li
            key={i}
            className="text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl"
          >
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
