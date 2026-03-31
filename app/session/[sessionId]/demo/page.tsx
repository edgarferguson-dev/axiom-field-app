"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SessionShell } from "@/components/layout/session-shell";
import { PublicPrivateSplit } from "@/components/layout/public-private-split";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";
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
  const {
    session,
    addCoachingPrompt,
    setRepNotes,
    setPhase,
    markStarted,
    markCompleted,
  } = useSessionStore();

  const [loadingCoach, setLoadingCoach] = useState(false);
  const [activePrompt, setActivePrompt] = useState<CoachingPrompt | null>(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleStart() {
    markStarted();
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
    markCompleted();
    setPhase("debrief");
    router.push(`/session/${params.sessionId}/recap`);
  }

  const sig = activePrompt ? SIGNAL_CONFIG[activePrompt.signal] : null;
  const business = session?.business;
  const intel = session?.preCallIntel;

  // ── Public pane (buyer-facing) ──────────────────────────────────────────
  const publicPane = (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Live Demo
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {business?.name ?? "Business Overview"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {business?.type} · {business?.leadSource}
        </p>
      </div>

      {intel && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
              Current Situation
            </p>
            <p className="text-sm leading-relaxed">{intel.painPattern}</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
              Opportunity Areas
            </p>
            <ul className="space-y-2">
              {intel.keyOpportunities.map((opp, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                  {opp}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
            <p className="text-xs text-accent font-medium uppercase tracking-wider mb-1">
              Estimated Missed Value
            </p>
            <p className="text-xl font-semibold text-foreground">
              {intel.missedValueEstimate}
            </p>
            <p className="mt-0.5 text-xs text-muted">per month in uncontacted leads</p>
          </div>
        </div>
      )}

      {!started && (
        <button
          onClick={handleStart}
          className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
        >
          Start Demo Clock
        </button>
      )}
    </div>
  );

  // ── Private pane (rep-only coaching) ────────────────────────────────────
  const privatePane = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Rep Coaching
        </p>
        {started && (
          <span className="flex items-center gap-1.5 text-xs text-signal-green">
            <span className="h-1.5 w-1.5 rounded-full bg-signal-green animate-pulse-slow" />
            Live
          </span>
        )}
      </div>

      {activePrompt && sig ? (
        <div className={cn("rounded-xl border p-4 space-y-3 animate-slide-up", sig.border)}>
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
            <p className="text-xs text-muted mb-1">Say this now</p>
            <p className="text-sm font-medium leading-relaxed">
              &ldquo;{activePrompt.audioCue}&rdquo;
            </p>
          </div>

          <div>
            <p className="text-xs text-muted mb-1">Next move</p>
            <p className="text-sm leading-relaxed">{activePrompt.nextMove}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="text-sm text-muted">
            {started
              ? "Request coaching when you need it."
              : "Start the demo clock to activate coaching."}
          </p>
        </div>
      )}

      <button
        onClick={handleGetCoaching}
        disabled={loadingCoach || !started}
        className="w-full rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent transition hover:bg-accent/20 disabled:opacity-40"
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

      <div>
        <p className="mb-1.5 text-xs font-medium text-muted uppercase tracking-wider">
          Notes
        </p>
        <textarea
          value={session?.repNotes ?? ""}
          onChange={(e) => setRepNotes(e.target.value)}
          rows={3}
          placeholder="Prospect reactions, objections, questions…"
          className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition"
        />
      </div>

      {session && session.coachingPrompts.length > 0 && (
        <p className="text-xs text-muted text-center">
          {session.coachingPrompts.length} prompt
          {session.coachingPrompts.length > 1 ? "s" : ""} used this session
        </p>
      )}

      <button
        onClick={handleEndSession}
        className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted transition hover:border-signal-red/40 hover:text-signal-red"
      >
        End Session → Debrief
      </button>
    </div>
  );

  return (
    <SessionShell>
      <PublicPrivateSplit publicPane={publicPane} privatePane={privatePane} />
    </SessionShell>
  );
}
