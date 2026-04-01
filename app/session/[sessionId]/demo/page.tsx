"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionShell } from "@/components/layout/session-shell";
import { PublicPrivateSplit } from "@/components/layout/public-private-split";
import { PresentationEngine } from "@/components/presentation/PresentationEngine";
import { UploadSalesMaterial } from "@/components/presentation/UploadSalesMaterial";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";
import { resolveObjection } from "@/lib/flows/salesEngine";
import type { CoachingPrompt, SignalColor } from "@/types/session";

const SIGNAL_CONFIG: Record<SignalColor, { label: string; dot: string; border: string; text: string }> = {
  green: {
    label: "Momentum",
    dot: "bg-signal-green",
    border: "border-signal-green/40",
    text: "text-signal-green",
  },
  yellow: {
    label: "Redirect",
    dot: "bg-signal-yellow",
    border: "border-signal-yellow/40",
    text: "text-signal-yellow",
  },
  red: {
    label: "Objection",
    dot: "bg-signal-red",
    border: "border-signal-red/40",
    text: "text-signal-red",
  },
};

export default function DemoPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const addCoachingPrompt = useSessionStore((s) => s.addCoachingPrompt);
  const setRepNotes = useSessionStore((s) => s.setRepNotes);
  const setPhase = useSessionStore((s) => s.setPhase);
  const markStarted = useSessionStore((s) => s.markStarted);
  const applyPresentationMaterial = useSessionStore((s) => s.applyPresentationMaterial);
  const addSignal = useSessionStore((s) => s.addSignal);
  const addObjection = useSessionStore((s) => s.addObjection);
  const addSalesStep = useSessionStore((s) => s.addSalesStep);

  useEffect(() => {
    if (!session) return;
    setPhase("live-demo");
  }, [session?.id, setPhase]);

  const [loadingCoach, setLoadingCoach] = useState(false);
  const [activePrompt, setActivePrompt] = useState<CoachingPrompt | null>(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proceedToPricingSignal, setProceedToPricingSignal] = useState(0);

  function handleStart() {
    markStarted();
    setPhase("live-demo");
    setStarted(true);
  }

  async function handleGetCoaching() {
    if (!session?.business || !session?.preCallIntel) return;
    setLoadingCoach(true);
    setError(null);

    try {
      const res = await fetch("/api/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: session.business,
          preCallIntel: session.preCallIntel,
          repNotes: session.repNotes,
          previousPromptCount: session.coachingPrompts.length,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const prompt: CoachingPrompt = {
        id: `p-${Date.now()}`,
        timestamp: Date.now(),
        ...data,
      };

      addCoachingPrompt(prompt);
      setActivePrompt(prompt);
    } catch {
      setError("Failed to get coaching. Check your API key.");
    } finally {
      setLoadingCoach(false);
    }
  }

  function handleEndSession() {
    setPhase("offer-fit");
    router.push(`/session/${params.sessionId}/offer-fit`);
  }

  const sig = activePrompt ? SIGNAL_CONFIG[activePrompt.signal] : null;
  const business = session?.business;
  const intel = session?.preCallIntel;

  if (!session) {
    return (
      <SessionShell>
        <div className="space-y-3 text-sm text-muted">
          <p>No active session found.</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-accent underline underline-offset-2"
          >
            Return home to start a session
          </button>
        </div>
      </SessionShell>
    );
  }

  if (session.id !== params.sessionId) {
    return (
      <SessionShell>
        <div className="space-y-3 text-sm text-muted">
          <p>This URL does not match the loaded session.</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-accent underline underline-offset-2"
          >
            Go home
          </button>
        </div>
      </SessionShell>
    );
  }

  // ── Public pane (buyer-facing) ──────────────────────────────────────────
  const publicPane = (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 -top-px h-40 rounded-t-2xl bg-gradient-to-b from-accent/[0.07] via-transparent to-transparent"
        aria-hidden
      />
      <div className="relative space-y-8">
        <div className="flex items-start justify-between gap-4 border-b border-border/30 pb-6">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent/90">
              Your business
            </p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {business?.name ?? "Business Overview"}
            </h2>
            <p className="text-sm text-muted/90">
              {business?.type} · {business?.leadSource}
            </p>
          </div>
          {!started && (
            <button
              type="button"
              onClick={handleStart}
              className="shrink-0 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(59,130,246,0.5)] transition hover:opacity-95"
            >
              Start
            </button>
          )}
        </div>

        <PresentationEngine
          variant="continuous"
          proceedToPricingSignal={proceedToPricingSignal}
          onInteractiveProofMilestone={() => addSignal("green")}
          onPricingAccept={() => addSignal("green")}
          onOpenAccount={() => addSignal("green")}
          onHesitate={() => {
            addObjection("price");
            addSalesStep(resolveObjection("price"));
            addSignal("yellow");
          }}
          onReject={() => {
            addCoachingPrompt({
              id: `p-${Date.now()}`,
              timestamp: Date.now(),
              phase: "closing",
              signal: "red",
              audioCue:
                "Slow down. Acknowledge the no, then reopen with a low-risk next step—prove value before asking for commitment.",
              nextMove:
                "Ask what they'd need to see in the next 7 days to reconsider. Offer a narrow pilot that removes risk.",
              buySignal: undefined,
            });
          }}
        />
      </div>
    </div>
  );

  // ── Private pane (rep-only) — visually secondary ────────────────────────
  const privatePane = (
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
        onClick={handleGetCoaching}
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
        onClick={() => setProceedToPricingSignal((n) => n + 1)}
        disabled={!started}
        className="w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-xs font-medium text-muted transition hover:border-accent/30 hover:text-foreground disabled:opacity-40"
      >
        Jump to pricing →
      </button>

      <UploadSalesMaterial
        onIngest={(summary) => {
          applyPresentationMaterial(summary);
        }}
      />

      <div>
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted/80">
          Notes
        </p>
        <textarea
          value={session.repNotes ?? ""}
          onChange={(e) => setRepNotes(e.target.value)}
          rows={3}
          placeholder="Prospect reactions, objections, questions…"
          className="w-full resize-none rounded-lg border border-border/60 bg-surface/50 px-2.5 py-2 text-[11px] text-foreground placeholder:text-muted/70 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/15 transition"
        />
      </div>

      {session && session.coachingPrompts.length > 0 && (
        <p className="text-[10px] text-muted/80 text-center">
          {session.coachingPrompts.length} prompt
          {session.coachingPrompts.length > 1 ? "s" : ""} used this session
        </p>
      )}

      <button
        type="button"
        onClick={handleEndSession}
        className="w-full rounded-lg border border-border/60 px-3 py-2 text-xs font-medium text-muted transition hover:border-signal-red/35 hover:text-signal-red"
      >
        End Demo → Review Offer
      </button>
    </div>
  );

  return (
    <SessionShell>
      <PublicPrivateSplit surface="continuous" publicPane={publicPane} privatePane={privatePane} />
    </SessionShell>
  );
}
