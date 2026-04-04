"use client";

import { useCallback, useState } from "react";
import type { GapDiagnosis } from "@/types/scoutIntel";
import { ProofRunPhoneFrame } from "@/components/presentation/proof-beats/ProofRunPhoneFrame";
import { cn } from "@/lib/utils/cn";

function lossCaption(
  diagnosis: GapDiagnosis | null | undefined,
  missedValueLine: string | null | undefined
): string {
  if (missedValueLine?.trim()) return missedValueLine.trim();
  const leak = diagnosis?.estimatedMonthlyLeakage;
  const ticket = diagnosis?.avgTicket;
  if (leak != null && leak > 0) {
    return `Roughly $${leak.toLocaleString()}/mo walks when leads bounce — directional, not a promise.`;
  }
  if (ticket != null && ticket > 0) {
    return `At about $${ticket} per job, a few missed windows a week is real money on the table.`;
  }
  return "Every silent moment is a customer who books the next shop instead.";
}

/** SMS line for fix beat: real business name when present; neutral copy otherwise (no `{{name}}` / “us”). */
export function fixSmsPreviewLine(businessName: string | null | undefined): string {
  const t = businessName?.trim();
  if (t) return `Hi — it's ${t}. Want a time?`;
  return "Hi — thanks for reaching out. Here's a link to grab a time.";
}

type Variant = "missed" | "fix";

/**
 * Stepped 4-beat phone sequence for Missed Opportunity (beat-2) and The Fix (beat-3).
 * Local step state only; outer proof-run navigation unchanged.
 */
export function ProofRunPhoneSequence({
  variant,
  businessName,
  gapDiagnosis,
  missedValueLine,
  className,
}: {
  variant: Variant;
  businessName: string | null | undefined;
  gapDiagnosis: GapDiagnosis | null | undefined;
  missedValueLine?: string | null;
  className?: string;
}) {
  const [step, setStep] = useState(0);

  const missed = [
    { title: "Incoming contact", body: "Call, text, or DM — usually while you're with someone else." },
    { title: "Missed moment", body: "No instant answer and no self-serve path in that window." },
    { title: "They move on", body: "They pick whoever responds first or books online." },
    { title: "Commercial loss", body: lossCaption(gapDiagnosis, missedValueLine ?? null) },
  ];

  const fixSms = fixSmsPreviewLine(businessName);

  const fixed = [
    { title: "Same moment", body: "Lead still reaches out during a busy spell on the floor." },
    { title: "Immediate text-back", body: fixSms },
    { title: "Self-serve booking", body: "They lock a slot without chasing you down." },
    { title: "Outcome", body: "Calendar holds — fewer ghosted leads, same headcount." },
  ];

  const steps = variant === "missed" ? missed : fixed;
  const cur = Math.min(step, steps.length - 1);
  const isLast = cur === steps.length - 1;
  const frameVariant = variant === "missed" ? "warning" : "positive";

  const advance = useCallback(() => {
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }, [steps.length]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  return (
    <ProofRunPhoneFrame
      variant={frameVariant}
      className={className}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          {cur > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="min-h-12 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            >
              Back
            </button>
          ) : (
            <div className="hidden min-h-12 flex-1 sm:block" aria-hidden />
          )}
          <button
            type="button"
            onClick={advance}
            disabled={isLast}
            className={cn(
              "min-h-12 flex-[1.2] rounded-xl px-4 text-sm font-bold transition",
              variant === "missed"
                ? "bg-red-600/90 text-white hover:bg-red-600 disabled:cursor-default disabled:opacity-40"
                : "bg-teal-600 text-white hover:bg-teal-500 disabled:cursor-default disabled:opacity-40"
            )}
          >
            {isLast ? "End of sequence" : "Continue"}
          </button>
        </div>
      }
    >
      <button
        type="button"
        onClick={advance}
        disabled={isLast}
        className={cn(
          "w-full rounded-2xl border border-white/[0.07] bg-black/50 p-4 text-left transition",
          !isLast && "min-h-[140px] active:scale-[0.99]",
          isLast && "min-h-[120px]",
          variant === "missed" && cur === 3 && "border-red-500/35 bg-red-950/30",
          variant === "fix" && cur === 3 && "border-teal-500/35 bg-teal-950/25"
        )}
        aria-label={isLast ? "Final step" : "Tap to advance step"}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">
          Step {cur + 1} of {steps.length}
        </p>
        <p className={cn("mt-2 text-xl font-bold leading-tight text-white", variant === "fix" && "text-teal-50")}>
          {steps[cur]!.title}
        </p>
        <p className="mt-2 text-sm leading-snug text-white/70">{steps[cur]!.body}</p>
      </button>
      <p className="mt-2 text-center text-[10px] text-white/35">
        {isLast ? "Use deck controls to move on when the room is ready." : "Tap the screen or Continue — 48px+ controls below."}
      </p>
    </ProofRunPhoneFrame>
  );
}
