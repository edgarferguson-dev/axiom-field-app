"use client";

import Link from "next/link";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";
import type { ProofRunPhase } from "@/types/proofRun";

const BEAT_COUNT = 6;

function beatNumberFromPhase(phase: ProofRunPhase): number {
  if (phase === "complete") return BEAT_COUNT;
  if (phase.startsWith("beat-")) {
    const n = Number.parseInt(phase.slice("beat-".length), 10);
    return Number.isFinite(n) ? n : 1;
  }
  return 1;
}

/**
 * Runtime chrome for the buyer Proof Run: beat dots, skip-to-ask, completion handoff.
 * Beat bodies render in `PresentationEngine`; this shell only controls progression signals.
 */
export function ProofRunShell({ sessionId }: { sessionId: string }) {
  const phase = useSessionStore((s) => s.session?.proofRun?.phase ?? "idle");
  const proofRunDispatch = useSessionStore((s) => s.proofRunDispatch);
  const setLiveDemoBuyerStarted = useSessionStore((s) => s.setLiveDemoBuyerStarted);

  if (phase === "idle") return null;

  const showComplete = phase === "complete";
  const activeBeat = beatNumberFromPhase(phase);
  const canSkipToAsk = !showComplete && activeBeat < BEAT_COUNT;

  return (
    <div className="mb-4 space-y-3 rounded-xl border border-border/70 bg-card/50 px-3 py-3 sm:mb-5 sm:px-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Proof run</p>
        {canSkipToAsk ? (
          <button
            type="button"
            className="min-h-[40px] rounded-lg px-2 text-[11px] font-semibold text-accent underline-offset-2 hover:underline"
            onClick={() => proofRunDispatch({ type: "skip-to-ask" })}
          >
            Skip to ask
          </button>
        ) : null}
      </div>
      <div className="flex justify-center gap-2 sm:gap-2.5" aria-label="Beat progress">
        {Array.from({ length: BEAT_COUNT }, (_, i) => {
          const b = i + 1;
          const past = showComplete || b < activeBeat;
          const current = !showComplete && b === activeBeat;
          return (
            <span
              key={b}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-all",
                current && "scale-125 bg-accent ring-2 ring-accent/30",
                past && !current && "bg-accent/45",
                !past && !current && "bg-border/90"
              )}
              title={`Beat ${b}`}
            />
          );
        })}
      </div>
      <p className="text-center text-xs font-medium text-foreground">
        {showComplete
          ? "Run complete — continue to Review when you’re ready."
          : `Beat ${activeBeat} of ${BEAT_COUNT}`}
      </p>
      {showComplete ? (
        <Link
          href={`/session/${sessionId}/recap`}
          className="btn-primary flex min-h-[48px] items-center justify-center text-center text-sm font-semibold no-underline"
          onClick={() => {
            setLiveDemoBuyerStarted(false);
          }}
        >
          Go to Review
        </Link>
      ) : null}
    </div>
  );
}
