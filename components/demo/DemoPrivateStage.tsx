"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { useSessionStore } from "@/store/session-store";
import { getAdaptiveCoaching } from "@/lib/coaching/adaptiveCoaching";
import { QuickControlPanel } from "@/components/coaching/QuickControlPanel";
import { ProofPrivatePanel } from "@/components/proof/ProofPrivatePanel";
import { CloseRecommendationPanel } from "@/components/close/CloseRecommendationPanel";
import { MerchantProofCoachRail } from "@/components/demo/MerchantProofCoachRail";
import { PostRunCapturePanel } from "@/components/field/PostRunCapturePanel";
import { VisitMemoryPanel } from "@/components/field/VisitMemoryPanel";
import type { BuyerState } from "@/types/demo";
import type { PresentationSlide } from "@/lib/flows/presentationEngine";
import { listPresentationPacks } from "@/lib/presentation/packs/registry";
import type { OpeningMode } from "@/types/presentationPack";
import { DEFAULT_OPENING_MODE, DEFAULT_PRESENTATION_PACK_ID } from "@/types/presentationPack";

const BUYER_OPTIONS: { value: BuyerState; label: string }[] = [
  { value: "unknown", label: "?" },
  { value: "curious", label: "Curious" },
  { value: "skeptical", label: "Skeptic" },
  { value: "price_resistant", label: "Price" },
  { value: "distracted", label: "Split" },
  { value: "needs_reassurance", label: "Safe" },
  { value: "ready_to_buy", label: "Ready" },
];

const SIGNAL_DOT = {
  green: "bg-signal-green",
  yellow: "bg-signal-yellow",
  red: "bg-signal-red",
} as const;

const OPENING_MODE_OPTIONS: { value: OpeningMode; label: string }[] = [
  { value: "proof-snapshot", label: "Proof snapshot first" },
  { value: "micro-demo", label: "Micro-demo first" },
  { value: "pain-to-proof", label: "Pain → proof" },
];

/**
 * DaNI rep-facing shell: context chips + five-move coaching rail.
 */
export function DemoPrivateStage() {
  const liveSignal = useSessionStore((s) => s.signal);
  const buyerState = useSessionStore((s) => s.buyerState);
  const coachingMomentum = useSessionStore((s) => s.coachingMomentum);
  const demoSlideType = useSessionStore((s) => s.demoSlideType);
  const phase = useSessionStore((s) => s.session?.phase ?? "live-demo");
  const setBuyerState = useSessionStore((s) => s.setBuyerState);
  const setCoachingMomentum = useSessionStore((s) => s.setCoachingMomentum);
  const presentationPackId = useSessionStore(
    (s) => s.session?.presentation?.packId ?? DEFAULT_PRESENTATION_PACK_ID
  );
  const presentationOpeningMode = useSessionStore(
    (s) => s.session?.presentation?.openingMode ?? DEFAULT_OPENING_MODE
  );
  const setPresentationPackId = useSessionStore((s) => s.setPresentationPackId);
  const setPresentationOpeningMode = useSessionStore((s) => s.setPresentationOpeningMode);
  const offerTemplates = useSessionStore((s) => s.offerTemplates);
  const runOfferTemplateId = useSessionStore((s) => s.session?.presentation?.runOfferTemplateId);
  const defaultOfferTemplateId = useSessionStore((s) => s.defaultOfferTemplateId);
  const setPresentationRunOfferTemplateId = useSessionStore((s) => s.setPresentationRunOfferTemplateId);
  const slides = useSessionStore((s) => s.session?.presentation?.generatedSlides);
  const activeSlideIndex = useSessionStore((s) => s.session?.presentation?.activeSlideIndex ?? 0);
  const businessName = useSessionStore((s) => s.session?.business?.name ?? "");

  const merchantProofBeat = useMemo(() => {
    if (!slides?.length) return null;
    const i = Math.min(Math.max(0, activeSlideIndex), slides.length - 1);
    const slide = slides[i] as PresentationSlide | undefined;
    return slide && "conversation" in slide && slide.conversation ? slide.conversation : null;
  }, [slides, activeSlideIndex]);

  const coaching = useMemo(
    () =>
      getAdaptiveCoaching({
        buyerState,
        signal: liveSignal,
        momentum: coachingMomentum,
        phase,
        currentStep: demoSlideType,
        merchantProofBeat,
      }),
    [buyerState, liveSignal, coachingMomentum, phase, demoSlideType, merchantProofBeat]
  );

  const packs = useMemo(() => listPresentationPacks(), []);
  const showPackPicker = packs.length > 1;

  const defaultOfferLabel = useMemo(() => {
    const d = offerTemplates.find((t) => t.id === defaultOfferTemplateId);
    return d?.label ?? "Default";
  }, [offerTemplates, defaultOfferTemplateId]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <ProofPrivatePanel />

      <CloseRecommendationPanel />

      <VisitMemoryPanel businessNameHint={businessName} compact />

      <PostRunCapturePanel />

      <section
        className="rounded-2xl border border-border bg-card px-3 py-3 shadow-soft ring-1 ring-foreground/[0.06]"
        aria-label="Presentation pack"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Proof-led deck</p>
        <p className="mt-1 text-xs text-muted">
          Pack + opening order. Offer below sets the single in-room ask — buyer never sees a tier matrix.
        </p>
        <div
          className={cn("mt-3 grid gap-2", showPackPicker ? "sm:grid-cols-2" : "sm:max-w-sm")}
        >
          {showPackPicker ? (
            <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted">
              Pack
              <select
                className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm font-medium text-foreground"
                value={presentationPackId}
                onChange={(e) => setPresentationPackId(e.target.value)}
              >
                {packs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted">
            Opening
            <select
              className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm font-medium text-foreground"
              value={presentationOpeningMode}
              onChange={(e) => setPresentationOpeningMode(e.target.value as OpeningMode)}
            >
              {OPENING_MODE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-3 block text-[10px] font-semibold uppercase tracking-wide text-muted">
          In-room offer
          <select
            className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm font-medium text-foreground"
            value={runOfferTemplateId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setPresentationRunOfferTemplateId(v === "" ? null : v);
            }}
          >
            <option value="">Workspace default — {defaultOfferLabel}</option>
            {offerTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <MerchantProofCoachRail />

      <header className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Rep view</p>
        <p className="text-xs text-muted">Set signal context — coaching lines refresh from there.</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-3 py-2.5 shadow-soft ring-1 ring-foreground/[0.06]">
        <div className="flex items-center gap-2">
          <span className={cn("h-3 w-3 shrink-0 rounded-full", SIGNAL_DOT[liveSignal])} aria-hidden />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground">Room</span>
        </div>
        <div className="flex max-w-[min(100%,20rem)] flex-wrap justify-end gap-1">
          {BUYER_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setBuyerState(o.value)}
              className={cn(
                "min-h-[36px] min-w-[2.25rem] rounded-lg px-2 text-xs font-semibold transition",
                buyerState === o.value
                  ? "bg-accent text-white shadow-sm"
                  : "bg-surface text-muted hover:text-foreground"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex gap-1 rounded-2xl border border-border bg-card p-2 shadow-soft ring-1 ring-foreground/[0.06]"
        role="group"
        aria-label="Momentum"
      >
        {(["up", "flat", "down"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setCoachingMomentum(v)}
            className={cn(
              "min-h-[44px] flex-1 rounded-xl text-xs font-bold uppercase tracking-[0.12em]",
              coachingMomentum === v ? "bg-accent text-white" : "text-muted hover:bg-surface"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      <section
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft ring-1 ring-foreground/[0.06]"
        aria-label="In-room coaching"
      >
        <div className="border-b border-border/60 bg-surface/90 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Your next five moves</p>
          <p className="mt-0.5 text-xs text-muted">
            {merchantProofBeat
              ? "Same rhythm as the beat card above — glance, don’t narrate."
              : "One line each — read once, eyes back on them."}
          </p>
        </div>
        <div className="p-3 sm:p-4">
          <QuickControlPanel coaching={coaching} variant={merchantProofBeat ? "merchantRhythm" : "classic"} />
        </div>
      </section>
    </div>
  );
}
