"use client";

import { useState, useEffect } from "react";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";

export function LiveCoachingOverlay() {
  const latest = useSessionStore((s) => s.session?.coachingPrompts.at(-1));
  const promptCount = useSessionStore((s) => s.session?.coachingPrompts.length ?? 0);
  const [dismissed, setDismissed] = useState(false);
  const [lastId, setLastId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (latest?.id !== lastId) {
      setLastId(latest?.id);
      if (dismissed) setDismissed(false);
    }
  }, [latest?.id]);

  if (!latest || dismissed) return null;

  const signalClass = {
    green: "border-signal-green/30 [&_[data-dot]]:bg-signal-green [&_[data-badge]]:bg-signal-green/20 [&_[data-badge]]:text-signal-green",
    yellow: "border-signal-yellow/30 [&_[data-dot]]:bg-signal-yellow [&_[data-badge]]:bg-signal-yellow/20 [&_[data-badge]]:text-signal-yellow",
    red: "border-signal-red/30 [&_[data-dot]]:bg-signal-red [&_[data-badge]]:bg-signal-red/20 [&_[data-badge]]:text-signal-red",
  }[latest.signal];

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[320px] animate-fade-in">
      <div className={cn("rounded-2xl border bg-card/95 p-4 shadow-soft backdrop-blur-xl", signalClass)}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span data-dot className="h-2 w-2 rounded-full" />
            <span className="text-xs font-medium text-muted">Live Coaching</span>
            {promptCount > 1 && (
              <span className="rounded-full bg-border px-1.5 py-0.5 text-[10px] text-muted">
                {promptCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span data-badge className="rounded-full px-2 py-0.5 text-xs font-medium">
              {latest.signal.toUpperCase()}
            </span>
            <button
              onClick={() => setDismissed(true)}
              className="text-muted transition hover:text-foreground"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="mb-2 text-sm font-medium leading-snug text-foreground">
          {latest.audioCue}
        </div>

        <div className="text-xs leading-relaxed text-muted">{latest.nextMove}</div>

        {latest.buySignal && (
          <div className="mt-3 rounded-xl border border-signal-green/20 bg-signal-green/10 px-3 py-2 text-xs text-signal-green">
            {latest.buySignal}
          </div>
        )}
      </div>
    </div>
  );
}
