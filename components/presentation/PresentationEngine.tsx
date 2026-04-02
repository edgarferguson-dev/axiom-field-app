"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useSessionStore } from "@/store/session-store";
import type { PresentationSlide, SlideType } from "@/lib/flows/presentationEngine";
import { narrativeChapterIndexForSlideType, NARRATIVE_CHAPTERS } from "@/lib/presentation/narrativeChapter";
import { PricingCard } from "@/components/presentation/PricingCard";
import { SlideRenderer } from "@/components/presentation/SlideRenderer";

type PresentationEngineProps = {
  proceedToPricingSignal?: number;
  onInteractiveProofMilestone?: () => void;
  onOpenAccount?: () => void;
  onPricingAccept?: () => void;
  onHesitate?: () => void;
  onReject?: () => void;
  variant?: "default" | "continuous";
};

const EMPTY_SLIDES: PresentationSlide[] = [];

function findSlideIndex(slides: PresentationSlide[], type: SlideType): number {
  const idx = slides.findIndex((s) => s.type === type);
  return idx >= 0 ? idx : 0;
}

export function PresentationEngine({
  proceedToPricingSignal,
  onInteractiveProofMilestone,
  onOpenAccount,
  onPricingAccept,
  onHesitate,
  onReject,
  variant = "default",
}: PresentationEngineProps) {
  const business = useSessionStore((s) => s.session?.business);
  const presentation = useSessionStore((s) => s.session?.presentation);
  const ensurePresentationSlides = useSessionStore((s) => s.ensurePresentationSlides);
  const setPresentationPricingTierId = useSessionStore((s) => s.setPresentationPricingTierId);
  const setPresentationPricingResponse = useSessionStore((s) => s.setPresentationPricingResponse);
  const setPresentationOpenAccountStarted = useSessionStore(
    (s) => s.setPresentationOpenAccountStarted
  );
  const dispatchInteractiveProofEvent = useSessionStore(
    (s) => s.dispatchInteractiveProofEvent
  );

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

  const emptyShell =
    variant === "continuous"
      ? "rounded-2xl border border-border/40 bg-gradient-to-b from-card/40 to-background/60 p-10 text-center shadow-none backdrop-blur-sm"
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
        <div className="mx-auto mb-3 h-8 w-8 animate-pulse rounded-full border-2 border-accent/20 border-t-accent" />
        Preparing your deck…
      </div>
    );
  }

  const slide = slides[index]!;
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
  const closeIdx = findSlideIndex(slides, "close-open-account");
  const canSkipToOffer = pricingIdx >= 0 && index < pricingIdx;
  const chapterIdx = narrativeChapterIndexForSlideType(slide.type);

  const shellClass =
    variant === "continuous"
      ? "relative overflow-hidden rounded-2xl border border-border/35 bg-gradient-to-b from-card/80 via-card/40 to-background/55 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_24px_80px_-40px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-9 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent/30 before:to-transparent"
      : "rounded-2xl border border-border bg-card p-6 shadow-soft";

  const titleClass =
    variant === "continuous"
      ? "text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-snug"
      : "text-2xl font-semibold tracking-tight text-foreground";

  const skipWalkthrough =
    slide.type === "interactive-proof"
      ? () => setIndex((i) => Math.min(slides.length - 1, i + 1))
      : undefined;

  return (
    <div className={variant === "continuous" ? "space-y-0" : "space-y-4"}>
      <div className={shellClass}>
        {variant === "continuous" && (
          <div className="mb-5 flex flex-wrap items-center gap-1.5 sm:gap-2">
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

        <div className={cn("mb-5", variant === "continuous" && "border-b border-border/25 pb-5")}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              {slide.kicker && (
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent sm:text-xs sm:tracking-[0.24em]">
                  {slide.kicker}
                </p>
              )}
              <h2 className={cn(titleClass, slide.kicker && "mt-2")}>{slide.title}</h2>
              {slide.subtitle && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-[15px]">
                  {slide.subtitle}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
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
            </div>
          </div>

          {variant === "continuous" && (
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
            <div className="mt-5 rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                {slide.callout.label}
              </div>
              <div className="mt-1.5 text-sm leading-snug text-foreground/95">{slide.callout.value}</div>
            </div>
          )}
        </div>

        {"bullets" in slide && slide.bullets && slide.bullets.length > 0 && (
          <SlideRenderer
            slide={slide}
            interactiveProofState={ipState}
            onInteractiveProofDispatch={dispatchInteractiveProofEvent}
            interactiveProofCompleted={interactiveProofCompleted}
            onSkipWalkthrough={skipWalkthrough}
          />
        )}

        {slide.type !== "pricing" && !("bullets" in slide && slide.bullets?.length) && (
          <SlideRenderer
            slide={slide}
            interactiveProofState={ipState}
            onInteractiveProofDispatch={dispatchInteractiveProofEvent}
            interactiveProofCompleted={interactiveProofCompleted}
            onSkipWalkthrough={skipWalkthrough}
          />
        )}

        {slide.type === "pricing" && (
          <div className="mt-2 space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              {slide.tiers.map((tier) => (
                <PricingCard
                  key={tier.id}
                  tier={tier}
                  selected={selectedTierId === tier.id}
                  onSelect={() => setPresentationPricingTierId(tier.id)}
                />
              ))}
            </div>

            {slide.disclaimer && (
              <div className="text-xs leading-relaxed text-muted">{slide.disclaimer}</div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted">
                {selectedTierId ? "Option selected — continue when ready." : "Select an option to continue."}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={cn(
                    "rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition",
                    "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  )}
                  disabled={!selectedTierId}
                  onClick={() => {
                    setPresentationPricingResponse("accept");
                    if (closeIdx >= 0) setIndex(closeIdx);
                    onPricingAccept?.();
                  }}
                >
                  Continue
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-border/80 bg-card/60 px-4 py-2.5 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-foreground"
                  onClick={() => {
                    setPresentationPricingResponse("hesitate");
                    onHesitate?.();
                  }}
                >
                  Need a moment
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-border/80 bg-card/60 px-4 py-2.5 text-sm font-medium text-muted transition hover:border-signal-red/40 hover:text-signal-red"
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

        {slide.type === "close-open-account" && (
          <div className="mt-2 flex flex-col gap-4 rounded-xl border border-accent/15 bg-accent/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted">
              Ready to move forward? Confirm the handoff step on the right when it makes sense for the room.
            </div>
            <button
              type="button"
              className="shrink-0 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
              onClick={() => {
                setPresentationOpenAccountStarted(true);
                onOpenAccount?.();
              }}
            >
              {slide.ctaLabel}
            </button>
          </div>
        )}

        <div
          className={cn(
            "mt-8 flex flex-col gap-3 border-t border-border/30 pt-6",
            "sm:flex-row sm:items-center sm:justify-between"
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={atStart}
              className="rounded-xl border border-border/80 bg-card/50 px-4 py-2.5 text-sm font-medium text-muted transition hover:border-accent/35 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
              disabled={atEnd}
              className="rounded-xl border border-accent/45 bg-accent/12 px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/18 disabled:cursor-not-allowed disabled:opacity-35"
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
