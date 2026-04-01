"use client";

import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session-store";
import { resolveObjection, getSignalForObjection } from "@/lib/flows/salesEngine";
import { PublicPrivateSplit } from "@/components/layout/public-private-split";
import { cn } from "@/lib/utils/cn";
import type { ObjectionType, CoachingPrompt, SessionPhase } from "@/types/session";

const OBJECTIONS: { key: ObjectionType; label: string; sub: string }[] = [
  { key: "price", label: "Too expensive", sub: "Budget resistance" },
  { key: "busy", label: "Too busy right now", sub: "Time pressure" },
  { key: "already-have", label: "Already using something", sub: "Status quo barrier" },
  { key: "not-interested", label: "Not interested", sub: "Disengagement risk" },
  { key: "timing", label: "Bad timing", sub: "Commitment delay" },
];

const SIGNAL_DOT: Record<string, string> = {
  green: "bg-signal-green",
  yellow: "bg-signal-yellow",
  red: "bg-signal-red",
};

function createCoachingPrompt(type: ObjectionType, phase: SessionPhase): CoachingPrompt {
  const map: Record<ObjectionType, Omit<CoachingPrompt, "id" | "timestamp" | "phase">> = {
    "not-interested": {
      signal: "red",
      audioCue: "Slow down. Acknowledge the resistance, then reset around what they're quietly losing.",
      nextMove: "Don't push harder — reframe around the cost of inaction, not the product.",
      buySignal: undefined,
    },
    price: {
      signal: "yellow",
      audioCue: "Anchor on value before defending the number.",
      nextMove: "Use the recovered-job framing, then ask a low-pressure proof question.",
      buySignal: undefined,
    },
    busy: {
      signal: "yellow",
      audioCue: "Being busy is the opening — that's when leads slip through.",
      nextMove: "Show how this works in the background without adding to their plate.",
      buySignal: "Still engaging, which means the conversation has room to move.",
    },
    "already-have": {
      signal: "yellow",
      audioCue: "Don't challenge their current system — find the gap it leaves.",
      nextMove: "Ask if it catches every inquiry within minutes, even off-hours.",
      buySignal: "They're defending the current tool, which means they care about coverage.",
    },
    timing: {
      signal: "yellow",
      audioCue: "Acknowledge the timing concern without validating the delay.",
      nextMove: "Make the first step feel low-commitment and fast to start.",
      buySignal: "Still in the conversation — timing objections are often commitment hesitation.",
    },
  };

  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`,
    timestamp: Date.now(),
    phase,
    ...map[type],
  };
}

export default function DemoEngine() {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const addObjection = useSessionStore((s) => s.addObjection);
  const addSalesStep = useSessionStore((s) => s.addSalesStep);
  const addSignal = useSessionStore((s) => s.addSignal);
  const addCoachingPrompt = useSessionStore((s) => s.addCoachingPrompt);
  const setPhase = useSessionStore((s) => s.setPhase);
  const reset = useSessionStore((s) => s.reset);

  const lastStep = useSessionStore((s) => s.session?.salesSteps?.at(-1));
  const signals = session?.signals ?? [];
  const objectionCount = session?.objections?.length ?? 0;

  const handleObjection = (type: ObjectionType) => {
    if (!session) return;
    if (session.phase === "intake" || session.phase === "field-read") setPhase("live-demo");
    addObjection(type);
    addSalesStep(resolveObjection(type));
    addSignal(getSignalForObjection(type));
    addCoachingPrompt(createCoachingPrompt(type, session.phase));
  };

  const handleGreenSignal = () => {
    if (!session) return;
    addSignal("green");
    setPhase("closing");
  };

  if (!session) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-border text-center">
        <div>
          <div className="text-sm font-medium text-foreground">No active session</div>
          <div className="mt-1 text-xs text-muted">Start a session to begin the demo simulation.</div>
        </div>
        <button
          onClick={() => router.push("/")}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
        >
          Start Session
        </button>
      </div>
    );
  }

  return (
    <PublicPrivateSplit
      publicPane={
        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Live Demo
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                Conversation Simulation
              </h2>
              <p className="mt-1 text-sm text-muted">
                Trigger objections to test live sequencing and coaching behavior.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {signals.slice(-5).map((s, i) => (
                <span key={i} className={cn("h-2 w-2 rounded-full", SIGNAL_DOT[s])} />
              ))}
              {objectionCount > 0 && (
                <span className="rounded-full border border-border bg-card px-2 py-0.5 text-xs text-muted">
                  {objectionCount} objection{objectionCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            {OBJECTIONS.map((item) => (
              <button
                key={item.key}
                onClick={() => handleObjection(item.key)}
                className={cn(
                  "rounded-2xl border bg-card p-4 text-left transition hover:bg-surface",
                  item.key === "not-interested"
                    ? "border-signal-red/20 hover:border-signal-red/40"
                    : "border-border hover:border-accent/40"
                )}
              >
                <div className="text-sm font-medium text-foreground">{item.label}</div>
                <div className="mt-0.5 text-xs text-muted">{item.sub}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGreenSignal}
              className="flex-1 rounded-xl border border-signal-green/20 bg-signal-green/10 py-2.5 text-sm font-semibold text-signal-green transition hover:bg-signal-green/20"
            >
              Mark Buy Signal
            </button>
            <button
              onClick={reset}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-muted transition hover:border-signal-red/30 hover:text-signal-red"
            >
              Reset
            </button>
          </div>
        </div>
      }
      privatePane={
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Sales Guidance
            </p>
            <h3 className="mt-1 text-sm font-semibold text-foreground">
              Rebuttal → Benefit → Question → Close
            </h3>
          </div>

          {lastStep ? (
            <div className="space-y-4 text-sm">
              {(
                [
                  { key: "rebuttal", label: "Rebuttal", value: lastStep.rebuttal, accent: false },
                  { key: "benefit", label: "Benefit", value: lastStep.benefit, accent: false },
                  { key: "question", label: "Question", value: lastStep.question, accent: false },
                  { key: "close", label: "Close", value: lastStep.close, accent: true },
                ] as { key: string; label: string; value: string; accent: boolean }[]
              ).map((row) => (
                <div key={row.key}>
                  <p className="mb-1 text-xs text-muted">{row.label}</p>
                  <p className={cn("leading-relaxed", row.accent ? "text-accent" : "text-foreground")}>
                    {row.value}
                  </p>
                </div>
              ))}
              {signals.at(-1) && (
                <div className={cn(
                  "rounded-xl border px-3 py-2 text-xs",
                  signals.at(-1) === "green"
                    ? "border-signal-green/20 text-signal-green"
                    : signals.at(-1) === "yellow"
                    ? "border-signal-yellow/20 text-signal-yellow"
                    : "border-signal-red/20 text-signal-red"
                )}>
                  Signal: {signals.at(-1)!.toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">
              Trigger an objection to generate live guidance.
            </div>
          )}
        </div>
      }
    />
  );
}
