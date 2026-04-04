"use client";

import type { ReactNode } from "react";
import type { PresentationSlide } from "@/lib/flows/presentationEngine";
import type { GapDiagnosis } from "@/types/scoutIntel";
import type { BusinessProfile } from "@/types/session";
import type { OfferTemplate } from "@/types/offerTemplate";
import { PricingCard } from "@/components/presentation/PricingCard";
import { cn } from "@/lib/utils/cn";

type PricingSlide = Extract<PresentationSlide, { type: "pricing" }>;

/**
 * Beat 5 — Ask (`pricing`). One guided decision; uses active offer + slide tiers + session leakage frame.
 */
export function ProofRunAskPanel({
  slide,
  business,
  gapDiagnosis,
  activeOffer,
  daniSurface,
  merchantVisualSlot,
  selectedTierId,
  onSelectTier,
  postPricingIdx,
  commitDeckIndex,
  setPresentationPricingResponse,
  onPricingAccept,
  onHesitate,
  onReject,
}: {
  slide: PricingSlide;
  business: BusinessProfile | null | undefined;
  gapDiagnosis: GapDiagnosis | null | undefined;
  activeOffer: OfferTemplate;
  daniSurface: boolean;
  merchantVisualSlot?: ReactNode;
  selectedTierId: string | null;
  onSelectTier: (id: string) => void;
  postPricingIdx: number;
  commitDeckIndex: (i: number) => void;
  setPresentationPricingResponse: (r: "accept" | "hesitate" | "reject") => void;
  onPricingAccept?: () => void;
  onHesitate?: () => void;
  onReject?: () => void;
}) {
  const name = business?.name?.trim() ?? "";
  const heading = name ? `Pilot for ${name}` : "Lean pilot";
  const sub = slide.subtitle?.trim() || activeOffer.pilotSubtitle || "One decision — not a stack comparison.";

  const ink = daniSurface;

  return (
    <div className={cn("mt-2 space-y-5", daniSurface && "mt-4 space-y-6")}>
      {merchantVisualSlot}

      <div
        className={cn(
          "rounded-2xl border px-4 py-4 sm:px-5 sm:py-5",
          ink
            ? "border-ink-border bg-ink-900 text-white shadow-[0_12px_40px_rgb(0_0_0/0.2)]"
            : "border-border/80 bg-background/40"
        )}
      >
        <p
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.2em]",
            ink ? "text-teal-400/90" : "text-accent"
          )}
        >
          The ask
        </p>
        <h3 className={cn("mt-2 text-xl font-bold tracking-tight sm:text-2xl", ink ? "text-white" : "text-foreground")}>
          {heading}
        </h3>
        <p className={cn("mt-2 text-sm leading-snug", ink ? "text-white/65" : "text-muted")}>{sub}</p>
        <p className={cn("mt-3 text-xs leading-relaxed", ink ? "text-white/45" : "text-muted")}>
          {slide.title}
        </p>
      </div>

      {gapDiagnosis ? (
        <div
          className={cn(
            "rounded-2xl border px-4 py-4",
            ink ? "border-teal-500/25 bg-black/40 text-white" : "border-accent/25 bg-accent/[0.05]"
          )}
        >
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-[0.18em]",
              ink ? "text-teal-400/95" : "text-accent"
            )}
          >
            Value frame
          </p>
          <p className={cn("mt-2 text-sm leading-snug", ink ? "text-white/88" : "text-foreground/90")}>
            Directional leak on the table is about ~${gapDiagnosis.estimatedMonthlyLeakage.toLocaleString()}/mo from
            scout signals. If this pilot recovers even a slice, {activeOffer.label} at ${activeOffer.monthlyFee}/mo is
            anchored to that gap — not to a feature list.
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "rounded-2xl border px-4 py-4",
            ink ? "border-white/10 bg-black/30 text-white/75" : "border-border/60 bg-card/40"
          )}
        >
          <p className="text-sm leading-snug">
            Anchor the pilot to the leak you walked — {activeOffer.label} at ${activeOffer.monthlyFee}/mo keeps the
            conversation commercial, not cosmetic.
          </p>
        </div>
      )}

      {slide.tiers.length === 1 ? (
        <div
          className={cn(
            "mx-auto max-w-md rounded-2xl border px-5 py-6 sm:px-6",
            ink
              ? "border-teal-500/35 bg-gradient-to-b from-teal-950/50 to-black/60 text-white shadow-[0_20px_50px_rgb(0_0_0/0.35)]"
              : "border-accent/30 bg-gradient-to-b from-accent/[0.09] to-surface shadow-soft ring-1 ring-inset ring-white/40"
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.16em]",
                  ink ? "text-white/50" : "text-muted"
                )}
              >
                Included pilot
              </p>
              <p className={cn("mt-1 text-lg font-bold", ink ? "text-white" : "text-foreground")}>
                {slide.tiers[0]!.name}
              </p>
              {slide.tiers[0]!.subtitle ? (
                <p className={cn("mt-1 text-xs font-medium", ink ? "text-white/55" : "text-muted")}>
                  {slide.tiers[0]!.subtitle}
                </p>
              ) : null}
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "text-3xl font-black tabular-nums sm:text-4xl",
                  ink ? "text-teal-200" : "text-accent"
                )}
              >
                ${activeOffer.monthlyFee}
                <span className="text-lg font-bold">/mo</span>
              </p>
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider", ink ? "text-white/40" : "text-muted")}>
                {activeOffer.setupFee <= 0 ? "No setup fee" : `$${Math.round(activeOffer.setupFee)} setup`}
              </p>
            </div>
          </div>
          <ul
            className={cn(
              "mt-5 space-y-2.5 border-t pt-4",
              ink ? "border-white/12" : "border-border/40"
            )}
          >
            {(slide.tiers[0]!.highlights.length > 0 ? slide.tiers[0]!.highlights : activeOffer.includedBullets).map(
              (h) => (
                <li
                  key={h}
                  className={cn(
                    "flex items-start gap-2.5 text-sm leading-snug",
                    ink ? "text-white/90" : "text-foreground/90"
                  )}
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                  {h}
                </li>
              )
            )}
          </ul>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-3",
            slide.tiers.length <= 1 ? "mx-auto max-w-md md:grid-cols-1" : "md:grid-cols-3",
            daniSurface && slide.tiers.length > 1 && "gap-4 md:gap-5"
          )}
        >
          {slide.tiers.map((tier) =>
            ink ? (
              <button
                key={tier.id}
                type="button"
                onClick={() => onSelectTier(tier.id)}
                className={cn(
                  "min-h-12 w-full rounded-2xl border px-4 py-4 text-left transition",
                  selectedTierId === tier.id
                    ? "border-teal-500/55 bg-teal-950/40 text-white ring-2 ring-teal-500/30"
                    : "border-white/10 bg-black/35 text-white hover:border-white/20"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold">{tier.name}</p>
                  <p className="text-sm font-black tabular-nums text-teal-200">{tier.price}</p>
                </div>
                {tier.subtitle ? <p className="mt-1 text-xs text-white/55">{tier.subtitle}</p> : null}
              </button>
            ) : (
              <PricingCard
                key={tier.id}
                tier={tier}
                selected={selectedTierId === tier.id}
                onSelect={() => onSelectTier(tier.id)}
              />
            )
          )}
        </div>
      )}

      {slide.disclaimer && (
        <p className={cn("text-[11px] leading-relaxed sm:text-xs", ink ? "text-white/45" : "text-muted")}>
          {slide.disclaimer}
        </p>
      )}

      <div
        className={cn(
          "rounded-2xl border px-4 py-4",
          ink ? "border-teal-500/20 bg-ink-950" : "border-border/50 bg-card/50"
        )}
      >
        <p className={cn("text-center text-[11px] sm:text-xs", ink ? "text-white/50" : "text-muted")}>
          {slide.tiers.length === 1 || selectedTierId
            ? "Calm yes — one tap moves the run forward when they’re ready."
            : "Pick the pilot that matches the room, then continue."}
        </p>
        <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
          <button
            type="button"
            className={cn(
              "min-h-12 w-full rounded-xl px-5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto",
              ink ? "bg-teal-600 hover:bg-teal-500" : "bg-accent hover:opacity-90"
            )}
            disabled={!selectedTierId}
            onClick={() => {
              setPresentationPricingResponse("accept");
              if (postPricingIdx >= 0) commitDeckIndex(postPricingIdx);
              onPricingAccept?.();
            }}
          >
            Yes — continue
          </button>
          <button
            type="button"
            className={cn(
              "min-h-12 w-full rounded-xl border px-4 text-sm font-medium transition sm:w-auto sm:min-h-12",
              ink
                ? "border-white/15 bg-white/5 text-white/85 hover:border-white/25"
                : "border-border/80 bg-card/60 text-muted hover:border-accent/40 hover:text-foreground"
            )}
            onClick={() => {
              setPresentationPricingResponse("hesitate");
              onHesitate?.();
            }}
          >
            Need a moment
          </button>
          <button
            type="button"
            className={cn(
              "min-h-12 w-full rounded-xl border px-4 text-sm font-medium transition sm:w-auto sm:min-h-12",
              ink
                ? "border-red-500/35 bg-red-950/20 text-red-100 hover:border-red-500/55"
                : "border-border/80 bg-card/60 text-muted hover:border-signal-red/40 hover:text-signal-red"
            )}
            onClick={() => {
              setPresentationPricingResponse("reject");
              onReject?.();
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
