"use client";

import { cn } from "@/lib/utils/cn";
import type { PricingTier } from "@/lib/flows/presentationEngine";

type PricingCardProps = {
  tier: PricingTier;
  selected: boolean;
  onSelect: () => void;
};

export function PricingCard({ tier, selected, onSelect }: PricingCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl border bg-card p-4 shadow-soft transition",
        "hover:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20",
        selected ? "border-accent-dark/45 ring-2 ring-accent-dark/20 shadow-medium" : "border-border"
      )}
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-foreground">{tier.name}</div>
            {tier.recommended && (
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                Recommended
              </span>
            )}
          </div>
          {tier.subtitle && <div className="mt-0.5 text-xs text-muted">{tier.subtitle}</div>}
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold text-foreground">{tier.price}</div>
          <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">Monthly</div>
        </div>
      </div>

      <ul className="mt-3 space-y-2">
        {tier.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2 text-xs text-muted">
            <span className={cn("mt-0.5 h-1.5 w-1.5 rounded-full", selected ? "bg-accent" : "bg-border")} />
            <span className="leading-relaxed">{h}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

