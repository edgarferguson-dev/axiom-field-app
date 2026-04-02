"use client";

import { UploadSalesMaterial } from "@/components/presentation/UploadSalesMaterial";
import { cn } from "@/lib/utils/cn";
import { COACHING_SIGNAL_STYLES } from "@/lib/ui/coachingSignalStyles";
import type { CoachingPrompt, PreCallIntel } from "@/types/session";
import type { MaterialSummary } from "@/lib/flows/materialEngine";

export type DemoCoachingPanelProps = {
  started: boolean;
  intel: PreCallIntel | null | undefined;
  activePrompt: CoachingPrompt | null;
  loadingCoach: boolean;
  error: string | null;
  onGetCoaching: () => void;
  onJumpToPricing: () => void;
  onMaterialIngest: (summary: MaterialSummary) => void;
  repNotes: string;
  onRepNotesChange: (value: string) => void;
  coachingPromptCount: number;
  onEndSession: () => void;
};

/**
 * Demo-stage **tactical** coaching surface (rep-only): pre-call angle, full prompt
 * lines (say-this / next move / buy signal), request flow, notes, and exit. Cross-stage
 * status is handled by `LiveCoachingOverlay`, which on this route stays a lightweight
 * signal layer and does not duplicate script copy.
 */
export function DemoCoachingPanel({
  started,
  intel,
  activePrompt,
  loadingCoach,
  error,
  onGetCoaching,
  onJumpToPricing,
  onMaterialIngest,
  repNotes,
  onRepNotesChange,
  coachingPromptCount,
  onEndSession,
}: DemoCoachingPanelProps) {
  const sig = activePrompt ? COACHING_SIGNAL_STYLES[activePrompt.signal] : null;

  return (
    <div className="space-y-3 text-[13px] leading-snug text-muted">
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted/80">
          For you · not shown on main screen
        </p>
        {started && (
          <span className="flex items-center gap-1 text-[10px] text-signal-green/90">
            <span className="h-1 w-1 rounded-full bg-signal-green" />
            Live
          </span>
        )}
      </div>

      {intel && (
        <div className="rounded-lg border border-border/50 bg-surface/50 p-3">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted/90">
            Pre-call angle
          </p>
          <p className="text-xs leading-relaxed text-foreground/85">
            &ldquo;{intel.recommendedAngle}&rdquo;
          </p>
        </div>
      )}

      {activePrompt && sig ? (
        <div className={cn("rounded-lg border p-3 space-y-2 animate-slide-up", sig.border)}>
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", sig.dot)} />
            <span className={cn("text-xs font-semibold uppercase tracking-wider", sig.text)}>
              {sig.label}
            </span>
          </div>

          {activePrompt.buySignal && (
            <div className="rounded-lg bg-signal-green/10 border border-signal-green/20 px-3 py-2">
              <p className="text-xs font-medium text-signal-green">Buy Signal Detected</p>
              <p className="text-xs text-foreground mt-0.5">{activePrompt.buySignal}</p>
            </div>
          )}

          <div>
            <p className="text-[10px] text-muted/90 mb-0.5">Say this now</p>
            <p className="text-xs font-medium leading-relaxed text-foreground/90">
              &ldquo;{activePrompt.audioCue}&rdquo;
            </p>
          </div>

          <div>
            <p className="text-[10px] text-muted/90 mb-0.5">Next move</p>
            <p className="text-xs leading-relaxed text-foreground/85">{activePrompt.nextMove}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/60 bg-surface/30 p-3 text-center">
          <p className="text-xs text-muted/90">
            {started
              ? "Request coaching when you need it."
              : "Start the session to activate coaching."}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onGetCoaching}
        disabled={loadingCoach || !started}
        className="w-full rounded-lg border border-accent/25 bg-accent/5 px-3 py-2.5 text-xs font-semibold text-accent/90 transition hover:bg-accent/10 disabled:opacity-40"
      >
        {loadingCoach ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Reading context…
          </span>
        ) : (
          "Get Coaching Prompt"
        )}
      </button>

      {error && <p className="text-xs text-signal-red">{error}</p>}

      <button
        type="button"
        onClick={onJumpToPricing}
        disabled={!started}
        className="w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-xs font-medium text-muted transition hover:border-accent/30 hover:text-foreground disabled:opacity-40"
      >
        Jump to pricing →
      </button>

      <UploadSalesMaterial onIngest={onMaterialIngest} />

      <div>
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted/80">Notes</p>
        <textarea
          value={repNotes}
          onChange={(e) => onRepNotesChange(e.target.value)}
          rows={3}
          placeholder="Prospect reactions, objections, questions…"
          className="w-full resize-none rounded-lg border border-border/60 bg-surface/50 px-2.5 py-2 text-[11px] text-foreground placeholder:text-muted/70 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/15 transition"
        />
      </div>

      {coachingPromptCount > 0 && (
        <p className="text-[10px] text-muted/80 text-center">
          {coachingPromptCount} prompt{coachingPromptCount > 1 ? "s" : ""} used this session
        </p>
      )}

      <button
        type="button"
        onClick={onEndSession}
        className="w-full rounded-lg border border-border/60 px-3 py-2 text-xs font-medium text-muted transition hover:border-signal-red/35 hover:text-signal-red"
      >
        End Demo → Review Offer
      </button>
    </div>
  );
}
