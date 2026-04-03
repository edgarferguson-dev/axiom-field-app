"use client";

import { useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { COACHING_SIGNAL_STYLES } from "@/lib/ui/coachingSignalStyles";
import { useSessionStore } from "@/store/session-store";
import { computeCloseCTAs } from "@/lib/flows/ctaEngine";
import { getCloseTacticalBlock } from "@/lib/flows/closeTacticalLines";
import { buildObjectionInterrupt } from "@/lib/flows/objectionInterrupt";
import { AxiomCard } from "@/components/ui/AxiomCard";
import { SignalBadge } from "@/components/ui/SignalBadge";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { CloseRail } from "@/components/demo/CloseRail";
import { CloseTacticalCard } from "@/components/demo/CloseTacticalCard";
import { ObjectionInterruptOverlay } from "@/components/demo/ObjectionInterruptOverlay";
import { DEMO_CLOSE_STATES, type CoachingPrompt, type DemoCloseState } from "@/types/session";
import type { PreCallIntel, FieldEngagementDecision, SignalColor } from "@/types/session";

function momentumLine(signal: SignalColor): string {
  switch (signal) {
    case "green":
      return "High intent — stay concise and drive the next step.";
    case "yellow":
      return "Build certainty before price or commitment.";
    case "red":
      return "Slow the pace — diagnose before you advance.";
    default:
      return "";
  }
}

export type DemoCoachingPanelProps = {
  started: boolean;
  intel: PreCallIntel | null | undefined;
  fieldEngagementDecision?: FieldEngagementDecision | null;
  activePrompt: CoachingPrompt | null;
  loadingCoach: boolean;
  error: string | null;
  onGetCoaching: () => void;
  onJumpToPricing: () => void;
  repNotes: string;
  onRepNotesChange: (value: string) => void;
  coachingPromptCount: number;
  onEndSession: () => void;
  /** Command Mode: fewer distractions, stronger focus on signal + next move. */
  closingFocus?: boolean;
  /** When true, hide duplicate buyer-signal header (private surface shows it above). */
  hideTopSignalBlock?: boolean;
  /** DaNI: no AI card, no empty state card, no long intel — close rail + actions only. */
  variant?: "full" | "dani";
};

export function DemoCoachingPanel({
  started,
  intel,
  fieldEngagementDecision,
  activePrompt,
  loadingCoach,
  error,
  onGetCoaching,
  onJumpToPricing,
  repNotes,
  onRepNotesChange,
  coachingPromptCount,
  onEndSession,
  closingFocus = false,
  hideTopSignalBlock = false,
  variant = "full",
}: DemoCoachingPanelProps) {
  const dani = variant === "dani";
  const setCloseState = useSessionStore((s) => s.setCloseState);
  const setCloseCTAs = useSessionStore((s) => s.setCloseCTAs);
  const setObjectionTriggered = useSessionStore((s) => s.setObjectionTriggered);
  const liveSignal = useSessionStore((s) => s.signal);

  const sessionId = useSessionStore((s) => s.session?.id ?? null);
  const storeCloseState = useSessionStore((s) => s.session?.closeState ?? null);
  const storePrimaryCTA = useSessionStore((s) => s.session?.primaryCTA ?? null);
  const storeBackupCTA = useSessionStore((s) => s.session?.backupCTA ?? null);
  const objectionTriggered = useSessionStore((s) => s.session?.objectionTriggered ?? false);
  const storeGate = useSessionStore((s) => s.session?.fieldEngagementDecision ?? null);

  const gate = fieldEngagementDecision ?? storeGate;

  useEffect(() => {
    if (!started) return;
    const s = useSessionStore.getState().session;
    if (!s) return;
    const needCt = !s.primaryCTA || !s.backupCTA;
    const needState = !s.closeState;
    if (!needCt && !needState) return;
    const g = s.fieldEngagementDecision;
    const ctas = computeCloseCTAs(g?.decision ?? "SOFT_GO", g?.confidence ?? 58);
    if (needState) setCloseState("hook");
    if (needCt) setCloseCTAs(ctas.primaryCTA, ctas.backupCTA);
  }, [started, sessionId, setCloseState, setCloseCTAs]);

  const fallbackCtas = useMemo(
    () => computeCloseCTAs(gate?.decision ?? "SOFT_GO", gate?.confidence ?? 58),
    [gate?.decision, gate?.confidence]
  );

  const primaryCTA = storePrimaryCTA ?? fallbackCtas.primaryCTA;
  const backupCTA = storeBackupCTA ?? fallbackCtas.backupCTA;
  const closeState = (storeCloseState ?? "hook") as DemoCloseState;

  const tactical = useMemo(
    () => getCloseTacticalBlock(closeState, intel, primaryCTA, backupCTA, gate),
    [closeState, intel, primaryCTA, backupCTA, gate]
  );

  const objectionContent = useMemo(() => buildObjectionInterrupt(intel, gate), [intel, gate]);

  const handleStepChange = useCallback(
    (step: DemoCloseState) => setCloseState(step),
    [setCloseState]
  );

  const handleAdvance = useCallback(() => {
    const i = DEMO_CLOSE_STATES.indexOf(closeState);
    if (i < 0 || i >= DEMO_CLOSE_STATES.length - 1) return;
    setCloseState(DEMO_CLOSE_STATES[i + 1]);
  }, [closeState, setCloseState]);

  const dismissObjection = useCallback(() => setObjectionTriggered(false), [setObjectionTriggered]);

  const sig = !dani && activePrompt ? COACHING_SIGNAL_STYLES[activePrompt.signal] : null;

  return (
    <div className={cn("text-sm leading-snug text-muted", dani ? "space-y-4" : "space-y-6")}>
      <ObjectionInterruptOverlay open={objectionTriggered} content={objectionContent} onResolved={dismissObjection} />

      {!hideTopSignalBlock && !dani && (
        <div className="space-y-3 border-b border-border/50 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="ax-label">Buyer signal</p>
              <SignalBadge type={liveSignal} />
            </div>
            {started && (
              <span className="rounded-full border border-signal-green/30 bg-emerald-50/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-signal-green">
                Live
              </span>
            )}
          </div>
          <p className="text-base font-medium leading-snug text-foreground">{momentumLine(liveSignal)}</p>
          {!closingFocus && backupCTA && (
            <p className="text-xs text-muted">
              If they hesitate: <span className="font-medium text-foreground/90">{backupCTA}</span>
            </p>
          )}
        </div>
      )}

      {started && sessionId ? (
        <div className={cn("space-y-3", closingFocus && "opacity-95")}>
          {dani ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Close sequence</p>
          ) : null}
          <CloseRail current={closeState} onStepChange={handleStepChange} onAdvance={handleAdvance} />
          <CloseTacticalCard stepKey={closeState} block={tactical} compact={dani} />
          <SecondaryButton
            type="button"
            onClick={() => setObjectionTriggered(true)}
            className="w-full min-h-[44px] border-dashed text-xs font-semibold uppercase tracking-wide"
          >
            Objection playbook
          </SecondaryButton>
        </div>
      ) : null}

      {!closingFocus && !dani && gate && gate.decision !== "WALK" && (
        <p className="text-sm text-foreground">
          <span className="text-muted">Gate </span>
          {gate.decision.replace(/_/g, " ")} <span className="tabular-nums text-muted">{gate.confidence}%</span>
        </p>
      )}

      {!closingFocus && !dani && intel && (
        <p className="text-sm leading-relaxed text-foreground">
          <span className="text-muted">Angle </span>
          &ldquo;{intel.recommendedAngle}&rdquo;
        </p>
      )}

      {!dani && activePrompt && sig ? (
        <AxiomCard
          className={cn(
            "space-y-5 border-accent/20 shadow-medium",
            closingFocus && "ring-1 ring-accent/15",
            sig.border
          )}
        >
          <div>
            <p className="ax-label mb-2">Next move</p>
            <p className="text-lg font-semibold leading-snug text-foreground">{activePrompt.nextMove}</p>
          </div>

          <div className="border-t border-border/50 pt-4">
            <p className="ax-label mb-2">Say this</p>
            <p className="text-base font-medium leading-relaxed text-foreground">
              &ldquo;{activePrompt.audioCue}&rdquo;
            </p>
          </div>

          {(activePrompt.openWith || activePrompt.avoidLead) && (
            <div className="grid gap-3 border-t border-border/40 pt-4 sm:grid-cols-2">
              {activePrompt.openWith && (
                <div>
                  <p className="ax-label mb-1">Open with</p>
                  <p className="text-sm leading-relaxed text-foreground">{activePrompt.openWith}</p>
                </div>
              )}
              {activePrompt.avoidLead && (
                <div>
                  <p className="ax-label mb-1">Avoid</p>
                  <p className="text-sm leading-relaxed text-foreground">{activePrompt.avoidLead}</p>
                </div>
              )}
            </div>
          )}

          {activePrompt.device && (
            <p className="text-xs text-muted">
              Device:{" "}
              <span className="font-medium text-foreground">
                {activePrompt.device === "now" ? "show now" : "hold for later"}
              </span>
            </p>
          )}

          {activePrompt.buySignal && (
            <div className="rounded-lg border border-signal-green/30 bg-emerald-50/90 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-signal-green">Buy signal</p>
              <p className="mt-1 text-sm text-foreground">{activePrompt.buySignal}</p>
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-border/40 pt-3">
            <span className={cn("h-2 w-2 rounded-full", sig.dot)} />
            <span className={cn("text-xs font-semibold uppercase tracking-wider", sig.text)}>{sig.label}</span>
          </div>
        </AxiomCard>
      ) : !dani ? (
        <AxiomCard className="border-dashed bg-background/50 text-center">
          <p className="text-sm text-muted">{started ? "Pull a coaching line when you need language." : "Start the deck to unlock the close rail."}</p>
        </AxiomCard>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        {!dani && (
          <button
            type="button"
            onClick={onGetCoaching}
            disabled={loadingCoach || !started}
            className="flex-1 rounded-lg border border-accent/30 bg-accent/[0.06] px-3 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/10 disabled:opacity-40"
          >
            {loadingCoach ? "Loading…" : "Coaching line"}
          </button>
        )}
        <button
          type="button"
          onClick={onJumpToPricing}
          disabled={!started}
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground transition hover:border-accent/30 disabled:opacity-40"
        >
          Jump to pricing
        </button>
      </div>

      {error && <p className="text-xs text-signal-red">{error}</p>}

      <div>
        <p className={cn("ax-label mb-2", dani && "text-[10px] tracking-[0.16em]")}>Quick notes</p>
        <textarea
          value={repNotes}
          onChange={(e) => onRepNotesChange(e.target.value)}
          rows={dani ? 2 : closingFocus ? 2 : 3}
          placeholder="Reactions, objections…"
          className="w-full resize-none rounded-lg border border-border/60 bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted/70 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/15"
        />
      </div>

      {!closingFocus && coachingPromptCount > 0 && (
        <p className="text-center text-xs text-muted">
          {coachingPromptCount} line{coachingPromptCount > 1 ? "s" : ""} this session
        </p>
      )}

      <button
        type="button"
        onClick={onEndSession}
        className="w-full rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-muted transition hover:border-accent/35 hover:text-foreground"
      >
        End demo — move to package fit
      </button>
    </div>
  );
}
