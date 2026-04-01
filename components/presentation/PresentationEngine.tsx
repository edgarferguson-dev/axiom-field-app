"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useSessionStore } from "@/store/session-store";
import type { PresentationSlide, SlideType } from "@/lib/flows/presentationEngine";
import { PricingCard } from "@/components/presentation/PricingCard";
import { SlideRenderer } from "@/components/presentation/SlideRenderer";

type PresentationEngineProps = {
  proceedToPricingSignal?: number;
  onInteractiveProofMilestone?: () => void;
  onOpenAccount?: () => void;
  /** Pricing tier accepted — does not complete account / onboarding */
  onPricingAccept?: () => void;
  onHesitate?: () => void;
  onReject?: () => void;
  /** Continuous surface: fewer nested cards for a single-stage feel */
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

  const shellClass =
    variant === "continuous"
      ? "relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-b from-card/70 via-card/35 to-background/50 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-sm sm:p-8 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent/25 before:to-transparent"
      : "rounded-2xl border border-border bg-card p-6 shadow-soft";

  return (
    <div className={variant === "continuous" ? "space-y-0" : "space-y-4"}>
      <div className={shellClass}>
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              {slide.kicker && (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {slide.kicker}
                </p>
              )}
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="mt-2 text-sm leading-relaxed text-muted">{slide.subtitle}</p>
              )}
            </div>

            <div className="hidden sm:flex flex-col items-end gap-2">
              <div className="text-[10px] uppercase tracking-wider text-muted">
                Slide {index + 1} / {slides.length}
              </div>
              <div className="h-1.5 w-32 rounded-full bg-border">
                <div
                  className="h-1.5 rounded-full bg-accent transition-[width] duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {"callout" in slide && slide.callout && (
            <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                {slide.callout.label}
              </div>
              <div className="mt-1 text-xs text-foreground">{slide.callout.value}</div>
            </div>
          )}
        </div>

        {"bullets" in slide && slide.bullets && slide.bullets.length > 0 && (
          <SlideRenderer
            slide={slide}
            interactiveProofState={ipState}
            onInteractiveProofDispatch={dispatchInteractiveProofEvent}
            interactiveProofCompleted={interactiveProofCompleted}
          />
        )}

        {slide.type !== "pricing" && !("bullets" in slide && slide.bullets?.length) && (
          <SlideRenderer
            slide={slide}
            interactiveProofState={ipState}
            onInteractiveProofDispatch={dispatchInteractiveProofEvent}
            interactiveProofCompleted={interactiveProofCompleted}
          />
        )}

        {slide.type === "pricing" && (
          <div className="mt-5 space-y-4">
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
              <div className="text-xs text-muted">{slide.disclaimer}</div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted">
                {selectedTierId ? "Option selected." : "Select an option to continue."}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className={cn(
                    "rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition",
                    "hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                  disabled={!selectedTierId}
                  onClick={() => {
                    setPresentationPricingResponse("accept");
                    const closeIdx = findSlideIndex(slides, "close-open-account");
                    if (closeIdx >= 0) setIndex(closeIdx);
                    onPricingAccept?.();
                  }}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-foreground"
                  onClick={() => {
                    setPresentationPricingResponse("hesitate");
                    onHesitate?.();
                  }}
                >
                  Hesitate
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted transition hover:border-signal-red/40 hover:text-signal-red"
                  onClick={() => {
                    setPresentationPricingResponse("reject");
                    onReject?.();
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {slide.type === "close-open-account" && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted">Continue when you&apos;re ready to move forward.</div>
            <button
              type="button"
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
              onClick={() => {
                setPresentationOpenAccountStarted(true);
                onOpenAccount?.();
              }}
            >
              {slide.ctaLabel}
            </button>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={atStart}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-foreground disabled:opacity-40"
          >
            Back
          </button>

          <div className="text-xs text-muted">
            {slide.type === "pricing"
              ? "Pricing"
              : slide.type === "interactive-proof"
              ? "Walkthrough"
              : slide.type === "close-open-account"
              ? "Account"
              : "Presentation"}
          </div>

          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
            disabled={atEnd}
            className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/20 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
