"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useSessionStore } from "@/store/session-store";
import type { PresentationSlide, SlideType } from "@/lib/flows/presentationEngine";
import { MerchantProofVisual } from "@/components/presentation/merchant/MerchantProofVisuals";

function stageGuidance(
  type: SlideType,
  interactiveProofComplete: boolean,
  dani: boolean
): string | null {
  if (dani) return null;
  switch (type) {
    case "proof-snapshot":
    case "comparison-proof":
    case "mock-flow":
    case "impact-stat":
      return "Let the visual do the work — one sentence max, then silence.";
    case "decision-next":
      return "Confirm appetite before numbers — then advance to pricing.";
    case "interactive-proof":
      return interactiveProofComplete
        ? "Proof is complete. Advance when the buyer is aligned."
        : "Complete the proof walkthrough together — then pricing unlocks.";
    case "pricing":
      return "One start option — let them nod, then continue.";
    case "presentation-actions":
      return "Pick the path that matches the room. Start setup is the forward motion when they are ready.";
    default:
      return null;
  }
}
import { narrativeChapterIndexForSlideType, NARRATIVE_CHAPTERS } from "@/lib/presentation/narrativeChapter";
import { BeatOneLiners } from "@/components/presentation/BeatOneLiners";
import { PricingCard } from "@/components/presentation/PricingCard";
import { SlideRenderer } from "@/components/presentation/SlideRenderer";

/** End-of-deck actions from demo — wired in demo page only. */
export type PresentationEndAction =
  | "start-setup"
  | "book-follow-up"
  | "revisit-pain"
  | "needs-review"
  | "not-fit";

type PresentationEngineProps = {
  proceedToPricingSignal?: number;
  onInteractiveProofMilestone?: () => void;
  onPresentationAction?: (action: PresentationEndAction) => void;
  onPricingAccept?: () => void;
  onHesitate?: () => void;
  onReject?: () => void;
  variant?: "default" | "continuous";
  /** DaNI public deck: large type, almost no chrome. */
  daniSurface?: boolean;
};

const EMPTY_SLIDES: PresentationSlide[] = [];

function findSlideIndex(slides: PresentationSlide[], type: SlideType): number {
  const idx = slides.findIndex((s) => s.type === type);
  return idx >= 0 ? idx : 0;
}

export function PresentationEngine({
  proceedToPricingSignal,
  onInteractiveProofMilestone,
  onPresentationAction,
  onPricingAccept,
  onHesitate,
  onReject,
  variant = "default",
  daniSurface = false,
}: PresentationEngineProps) {
  const business = useSessionStore((s) => s.session?.business);
  const presentation = useSessionStore((s) => s.session?.presentation);
  const ensurePresentationSlides = useSessionStore((s) => s.ensurePresentationSlides);
  const setPresentationPricingTierId = useSessionStore((s) => s.setPresentationPricingTierId);
  const setPresentationPricingResponse = useSessionStore((s) => s.setPresentationPricingResponse);
  const dispatchInteractiveProofEvent = useSessionStore(
    (s) => s.dispatchInteractiveProofEvent
  );
  const setDemoSlideType = useSessionStore((s) => s.setDemoSlideType);
  const setPresentationActiveSlideIndex = useSessionStore((s) => s.setPresentationActiveSlideIndex);

  const generatedSlides = presentation?.generatedSlides;
  const slides = generatedSlides ?? EMPTY_SLIDES;

  const [index, setIndex] = useState(0);

  const proofStepRef = useRef(presentation?.interactiveProof?.step);

  useEffect(() => {
    if (!business) return;
    ensurePresentationSlides();
  }, [business, ensurePresentationSlides]);

  useEffect(() => {
    if (slides.length === 0) return;
    setIndex((i) => Math.min(i, slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    const list = generatedSlides;
    if (!list?.length) return;
    if (!proceedToPricingSignal) return;
    setIndex(findSlideIndex(list, "pricing"));
  }, [proceedToPricingSignal, generatedSlides]);

  const activeSlideType =
    business && slides.length > 0
      ? slides[Math.min(index, slides.length - 1)]!.type
      : null;

  useEffect(() => {
    setDemoSlideType(activeSlideType);
  }, [activeSlideType, setDemoSlideType]);

  useEffect(() => {
    setPresentationActiveSlideIndex(index);
  }, [index, setPresentationActiveSlideIndex]);

  const singlePricingTierId =
    business && slides.length > 0
      ? (() => {
          const sl = slides[Math.min(index, slides.length - 1)]!;
          if (sl.type !== "pricing" || !("tiers" in sl) || sl.tiers.length !== 1) return null;
          return sl.tiers[0]!.id;
        })()
      : null;

  useEffect(() => {
    if (!singlePricingTierId) return;
    const current = presentation?.pricingTierId ?? null;
    if (current === singlePricingTierId) return;
    setPresentationPricingTierId(singlePricingTierId);
  }, [singlePricingTierId, presentation?.pricingTierId, setPresentationPricingTierId]);

  const interactiveProof = presentation?.interactiveProof;
  const interactiveProofCompleted = interactiveProof?.step === "confirmed";

  useEffect(() => {
    const step = presentation?.interactiveProof?.step;
    if (
      step === "confirmed" &&
      proofStepRef.current !== undefined &&
      proofStepRef.current !== "confirmed"
    ) {
      onInteractiveProofMilestone?.();
    }
    proofStepRef.current = step;
  }, [presentation?.interactiveProof?.step, onInteractiveProofMilestone]);

  const emptyShell = daniSurface
    ? "mx-auto w-full max-w-3xl px-6 py-16 text-center sm:px-10 sm:py-20"
    : variant === "continuous"
      ? "rounded-xl border border-border bg-surface p-10 text-center shadow-soft"
      : "rounded-2xl border border-border bg-surface p-6 text-center shadow-soft";

  if (!business) {
    return (
      <div className={emptyShell}>
        <div className="text-sm font-medium text-foreground">No business profile</div>
        <div className="mt-1 text-xs text-muted">Complete intake to generate a presentation.</div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className={`${emptyShell} text-sm text-muted`}>
        {daniSurface ? (
          <div className="mx-auto mb-4 h-1 w-14 rounded-full bg-accent/30" aria-hidden />
        ) : (
          <div className="mx-auto mb-3 h-8 w-8 animate-pulse rounded-full border-2 border-accent/20 border-t-accent" />
        )}
        Loading proof run…
      </div>
    );
  }

  const slide = slides[index]!;
  const hasBeatConversation = "conversation" in slide && Boolean(slide.conversation);
  const stageHint = stageGuidance(slide.type, interactiveProofCompleted, daniSurface);
  const atStart = index === 0;
  const atEnd = index === slides.length - 1;
  const progressPct = Math.round(((index + 1) / slides.length) * 100);
  const selectedTierId = presentation?.pricingTierId ?? null;

  const ipState = interactiveProof ?? {
    step: "phone" as const,
    phone: "",
    transcript: [],
    booking: null,
  };

  const pricingIdx = findSlideIndex(slides, "pricing");
  const actionsIdx = findSlideIndex(slides, "presentation-actions");
  const canSkipToOffer = pricingIdx >= 0 && index < pricingIdx;
  const chapterIdx = narrativeChapterIndexForSlideType(slide.type);

  const shellClass = daniSurface
    ? "relative w-full max-w-none overflow-hidden rounded-2xl bg-transparent px-3 py-5 sm:px-6 sm:py-8 md:px-10 md:py-10 lg:px-12"
    : variant === "continuous"
      ? "relative overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-soft sm:p-8"
      : "rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6";

  const titleClass = daniSurface
    ? "text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl sm:leading-[1.1] md:text-5xl md:leading-[1.08]"
    : variant === "continuous"
      ? "text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl sm:leading-snug md:text-[1.75rem]"
      : "text-xl font-semibold tracking-tight text-foreground sm:text-2xl";

  const subtitleClass = daniSurface
    ? "mt-5 max-w-4xl text-lg font-medium leading-snug text-foreground/80 line-clamp-4 sm:mt-6 sm:text-xl md:text-2xl md:leading-snug"
    : "mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-[15px]";

  const skipWalkthrough =
    slide.type === "interactive-proof"
      ? () => setIndex((i) => Math.min(slides.length - 1, i + 1))
      : undefined;

  return (
    <div className={variant === "continuous" ? "space-y-0" : "space-y-4"}>
      <div className={shellClass}>
        {daniSurface && (
          <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-border sm:mb-8">
            <div className="h-full rounded-full bg-accent-dark" style={{ width: `${progressPct}%` }} />
          </div>
        )}

        {variant === "continuous" && !daniSurface && <BeatOneLiners slideType={slide.type} />}

        {variant === "continuous" && !daniSurface && (
          <div className="mb-4 hidden flex-wrap items-center gap-1.5 sm:mb-5 sm:flex sm:gap-2">
            {NARRATIVE_CHAPTERS.map((ch, i) => {
              const active = chapterIdx === i;
              const past = chapterIdx > i;
              return (
                <span
                  key={ch.id}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] transition sm:px-3 sm:text-[10px]",
                    active && "bg-accent/18 text-accent ring-1 ring-accent/30",
                    past && !active && "text-muted/75",
                    !past && !active && "text-muted/40"
                  )}
                >
                  {ch.label}
                </span>
              );
            })}
          </div>
        )}

        <div className={cn("mb-4 sm:mb-5", variant === "continuous" && !daniSurface && "border-b border-border/25 pb-4 sm:pb-5")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              {slide.kicker && (
                <p
                  className={cn(
                    "font-semibold uppercase tracking-[0.22em] text-accent",
                    daniSurface ? "text-xs tracking-[0.2em]" : "text-[10px] sm:text-xs sm:tracking-[0.24em]"
                  )}
                >
                  {slide.kicker}
                </p>
              )}
              <h2 className={cn(titleClass, slide.kicker && "mt-2")}>{slide.title}</h2>
              {slide.subtitle && <p className={subtitleClass}>{slide.subtitle}</p>}
              {variant === "continuous" && stageHint && (
                <p className="mt-4 max-w-2xl border-l-2 border-accent/25 pl-4 text-sm font-medium leading-relaxed text-foreground">
                  {stageHint}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
              {!daniSurface ? (
                <>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
                      {index + 1} / {slides.length}
                    </span>
                    <span className="text-[10px] text-muted">{progressPct}%</span>
                  </div>
                  <div className="h-1.5 w-full min-w-[140px] rounded-full bg-border/80 sm:w-36">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-accent/90 to-accent transition-[width] duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </>
              ) : (
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted tabular-nums">
                  {index + 1} / {slides.length}
                </span>
              )}
            </div>
          </div>

          {variant === "continuous" && !daniSurface && (
            <div className="mt-4 flex gap-1" aria-hidden>
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i === index ? "bg-accent" : i < index ? "bg-accent/30" : "bg-border/70"
                  )}
                />
              ))}
            </div>
          )}

          {"callout" in slide && slide.callout && (
            <div
              className={cn(
                "mt-5 rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
                daniSurface && "mt-6 px-5 py-4 sm:px-6"
              )}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                {slide.callout.label}
              </div>
              <div
                className={cn(
                  "mt-1.5 leading-snug text-foreground/95",
                  daniSurface ? "text-base font-medium sm:text-lg" : "text-sm"
                )}
              >
                {slide.callout.value}
              </div>
            </div>
          )}
        </div>

        {variant === "continuous" && daniSurface && !hasBeatConversation && (
          <div className="mb-8 sm:mb-10">
            <BeatOneLiners slideType={slide.type} variant="dani" />
          </div>
        )}

        {"bullets" in slide && slide.bullets && slide.bullets.length > 0 && (
          <SlideRenderer
            slide={slide}
            tone={daniSurface ? "dani" : "default"}
            interactiveProofState={ipState}
            onInteractiveProofDispatch={dispatchInteractiveProofEvent}
            interactiveProofCompleted={interactiveProofCompleted}
            onSkipWalkthrough={skipWalkthrough}
          />
        )}

        {slide.type !== "pricing" && !("bullets" in slide && slide.bullets?.length) && (
          <SlideRenderer
            slide={slide}
            tone={daniSurface ? "dani" : "default"}
            interactiveProofState={ipState}
            onInteractiveProofDispatch={dispatchInteractiveProofEvent}
            interactiveProofCompleted={interactiveProofCompleted}
            onSkipWalkthrough={skipWalkthrough}
          />
        )}

        {slide.type === "pricing" && (
          <div className={cn("mt-2 space-y-5", daniSurface && "mt-4 space-y-6")}>
            {"merchantVisual" in slide && slide.merchantVisual ? (
              <div className="mb-2">
                <MerchantProofVisual
                  surface={slide.merchantVisual}
                  businessLabel={business?.name ?? undefined}
                  contextLine={
                    business?.type?.trim()
                      ? `How ${business.type.trim()} owners usually describe the leak`
                      : undefined
                  }
                />
              </div>
            ) : null}
            <div
              className={cn(
                "rounded-xl border border-border/80 bg-background/40 px-3 py-2.5 sm:px-4 sm:py-3",
                daniSurface && "border-border/60 bg-card/50 px-5 py-4"
              )}
            >
              <p className="ax-label">Commitment path</p>
              <p className={cn("mt-1 text-foreground", daniSurface ? "text-base font-medium sm:text-lg" : "text-sm")}>
                {daniSurface
                  ? "One lean start — next slide locks the move."
                  : "One offer on screen — nod means you’re aligned."}
              </p>
            </div>
            {slide.tiers.length === 1 ? (
              <div className="mx-auto max-w-md rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-4 shadow-inner">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">{slide.tiers[0]!.name}</p>
                    {slide.tiers[0]!.subtitle ? (
                      <p className="mt-0.5 text-xs text-muted">{slide.tiers[0]!.subtitle}</p>
                    ) : null}
                  </div>
                  <p className="text-right text-lg font-black tabular-nums text-accent">{slide.tiers[0]!.price}</p>
                </div>
                <ul className="mt-3 space-y-1.5 border-t border-border/40 pt-3">
                  {slide.tiers[0]!.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-xs text-foreground/90">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {h}
                    </li>
                  ))}
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
                {slide.tiers.map((tier) => (
                  <PricingCard
                    key={tier.id}
                    tier={tier}
                    selected={selectedTierId === tier.id}
                    onSelect={() => setPresentationPricingTierId(tier.id)}
                  />
                ))}
              </div>
            )}

            {slide.disclaimer && (
              <div className="text-[11px] leading-relaxed text-muted sm:text-xs">{slide.disclaimer}</div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[11px] text-muted sm:text-xs">
                {slide.tiers.length === 1 || selectedTierId
                  ? "Ready when they are — one tap forward."
                  : "Select a tier to unlock continue."}
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  className={cn(
                    "min-h-[48px] w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-soft transition sm:w-auto sm:py-2.5",
                    "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  )}
                  disabled={!selectedTierId}
                  onClick={() => {
                    setPresentationPricingResponse("accept");
                    if (actionsIdx >= 0) setIndex(actionsIdx);
                    onPricingAccept?.();
                  }}
                >
                  {actionsIdx >= 0 ? "Continue to decision" : "Continue"}
                </button>
                <button
                  type="button"
                  className="min-h-[48px] w-full rounded-xl border border-border/80 bg-card/60 px-4 py-3 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-foreground sm:w-auto sm:min-h-0 sm:py-2.5"
                  onClick={() => {
                    setPresentationPricingResponse("hesitate");
                    onHesitate?.();
                  }}
                >
                  Need a moment
                </button>
                <button
                  type="button"
                  className="min-h-[48px] w-full rounded-xl border border-border/80 bg-card/60 px-4 py-3 text-sm font-medium text-muted transition hover:border-signal-red/40 hover:text-signal-red sm:w-auto sm:min-h-0 sm:py-2.5"
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
        )}

        {slide.type === "presentation-actions" && onPresentationAction && (
          <div className={cn("mt-4 space-y-4", daniSurface && "mt-6 space-y-5")}>
            {"merchantVisual" in slide && slide.merchantVisual ? (
              <div className="mb-2">
                <MerchantProofVisual
                  surface={slide.merchantVisual}
                  businessLabel={business?.name ?? undefined}
                  contextLine={
                    business?.type?.trim()
                      ? `How ${business.type.trim()} owners usually describe the leak`
                      : undefined
                  }
                />
              </div>
            ) : null}
            <div>
              <p className="ax-label">Next step</p>
              <p className={cn("mt-1 text-muted", daniSurface ? "max-w-2xl text-base text-foreground/75" : "text-sm")}>
                {daniSurface
                  ? "One clear motion — lead with setup when they are ready."
                  : "The buyer should see one clear motion. Lead with setup when they&apos;re ready to move."}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                className="rounded-xl border border-accent/40 bg-accent/[0.07] px-3 py-3 text-left text-sm font-semibold text-foreground shadow-soft ring-1 ring-accent/15 transition hover:bg-accent/[0.1]"
                onClick={() => onPresentationAction("start-setup")}
              >
                Start setup
                <span className="mt-1 block text-xs font-normal text-muted">Primary forward path</span>
              </button>
              <button
                type="button"
                className="rounded-xl border border-border/80 bg-card px-3 py-3 text-left text-sm font-medium text-foreground shadow-soft transition hover:border-accent/35"
                onClick={() => onPresentationAction("book-follow-up")}
              >
                Book follow-up
              </button>
              <button
                type="button"
                className="rounded-xl border border-border/80 bg-card px-3 py-3 text-left text-sm font-medium text-foreground shadow-soft transition hover:border-accent/35"
                onClick={() => onPresentationAction("revisit-pain")}
              >
                Revisit pain
              </button>
              <button
                type="button"
                className="rounded-xl border border-border/80 bg-card px-3 py-3 text-left text-sm font-medium text-foreground shadow-soft transition hover:border-accent/35"
                onClick={() => onPresentationAction("needs-review")}
              >
                Needs review
              </button>
              <button
                type="button"
                className="rounded-xl border border-signal-red/25 bg-signal-red/5 px-3 py-3 text-left text-sm font-medium text-signal-red shadow-soft transition hover:border-signal-red/45 sm:col-span-2 lg:col-span-1"
                onClick={() => onPresentationAction("not-fit")}
              >
                Not a fit
              </button>
            </div>
          </div>
        )}

        <div
          className={cn(
            "mt-8 flex flex-col gap-3 border-t border-border/30 pt-6 sm:flex-row sm:items-center sm:justify-between",
            daniSurface && "mt-10 border-border/25 pt-7"
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={atStart}
              className={cn(
                "rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-35",
                daniSurface
                  ? "border-border/70 bg-transparent text-foreground/80 hover:border-accent/40 hover:bg-accent/[0.06]"
                  : "border-border/80 bg-card/50 text-muted hover:border-accent/35 hover:text-foreground"
              )}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
              disabled={atEnd}
              className={cn(
                "rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-35",
                daniSurface
                  ? "border-accent bg-accent text-white shadow-sm hover:opacity-90"
                  : "border-accent/45 bg-accent/12 text-accent hover:bg-accent/18"
              )}
            >
              Next
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {variant === "continuous" && canSkipToOffer && (
              <button
                type="button"
                onClick={() => setIndex(pricingIdx)}
                className="rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted transition hover:border-accent/30 hover:text-foreground"
              >
                Skip to offer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
