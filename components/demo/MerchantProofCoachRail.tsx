"use client";

import { useMemo } from "react";
import { useSessionStore } from "@/store/session-store";
import type { PresentationSlide } from "@/lib/flows/presentationEngine";
import { transitionIntentLabel } from "@/lib/presentation/merchantTransitionLabels";
import type { MerchantTransitionIntent } from "@/types/merchantProof";
import { cn } from "@/lib/utils/cn";

/**
 * Phase 7B/C — Private beat coaching: disciplined rhythm, not a talk track.
 */
export function MerchantProofCoachRail() {
  const slides = useSessionStore((s) => s.session?.presentation?.generatedSlides);
  const idx = useSessionStore((s) => s.session?.presentation?.activeSlideIndex ?? 0);

  const slide = useMemo((): PresentationSlide | null => {
    if (!slides?.length) return null;
    const i = Math.min(Math.max(0, idx), slides.length - 1);
    return slides[i] ?? null;
  }, [slides, idx]);

  const cue = slide && "conversation" in slide ? slide.conversation : undefined;

  if (!cue) return null;

  const intent: MerchantTransitionIntent = cue.transitionIntent ?? "continue_proof";

  return (
    <section
      className="rounded-2xl border border-accent/30 bg-gradient-to-b from-accent/[0.08] to-card px-3 py-3 shadow-soft ring-1 ring-foreground/[0.05]"
      aria-label="Beat coaching"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">This beat</p>
        <span className="rounded-full bg-foreground/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground">
          {transitionIntentLabel(intent)}
        </span>
      </div>
      <p className="mt-2 text-xs font-medium text-muted">{cue.proofPurpose}</p>

      <ol className="mt-3 space-y-2 text-xs">
        <li
          className={cn(
            "rounded-xl border-2 border-accent/50 bg-accent/[0.12] px-3 py-2.5 shadow-sm",
            "ring-1 ring-accent/20"
          )}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">1 · Ask now</span>
          <p className="mt-1 font-semibold leading-snug text-foreground">{cue.openingQuestion}</p>
        </li>
        <li className="rounded-lg border border-border/70 bg-card/50 px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">2 · Show proof</span>
          <p className="mt-1 text-muted">Buyer screen forward — let the mock land before you add words.</p>
        </li>
        <li className="rounded-lg border border-border/70 bg-card/50 px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">3 · Probe next</span>
          <p className="mt-1 font-medium leading-snug text-foreground">{cue.reactionProbe}</p>
        </li>
        <li className="rounded-xl border-2 border-signal-yellow/40 bg-signal-yellow/[0.08] px-3 py-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">4 · Wait</span>
          <p className="mt-1 font-semibold leading-snug text-foreground">{cue.silenceCue}</p>
        </li>
        <li className="rounded-lg border border-border/60 bg-surface/80 px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Coach</span>
          <p className="mt-1 text-foreground/90">{cue.privateCoachCue}</p>
        </li>
        {cue.positiveSignalCue ? (
          <li className="rounded-lg border border-signal-green/25 bg-signal-green/[0.06] px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">If they lean in</span>
            <p className="mt-1 font-medium text-foreground">{cue.positiveSignalCue}</p>
          </li>
        ) : null}
        {cue.hesitationCue ? (
          <li className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">If they hesitate</span>
            <p className="mt-1 font-medium text-foreground">{cue.hesitationCue}</p>
          </li>
        ) : null}
        {cue.objectionCue ? (
          <li className="rounded-lg border border-signal-red/20 bg-signal-red/[0.04] px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">If they push back</span>
            <p className="mt-1 font-medium text-foreground">{cue.objectionCue}</p>
          </li>
        ) : null}
        {cue.askWording ? (
          <li className="rounded-xl border-2 border-accent/35 bg-accent/[0.08] px-3 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Ask line</span>
            <p className="mt-1 font-semibold leading-snug text-foreground">{cue.askWording}</p>
          </li>
        ) : null}
        <li className="rounded-lg border border-dashed border-border/80 bg-background/60 px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">When to move</span>
          <p className="mt-1 font-medium text-foreground">{cue.transitionTrigger}</p>
        </li>
      </ol>
    </section>
  );
}
