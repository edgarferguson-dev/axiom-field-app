"use client";

import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";

type TopbarProps = {
  title?: string;
  subtitle?: string;
  status?: string;
};

const PHASE_LABELS: Record<string, string> = {
  "pre-call": "Pre-Call",
  intake: "Intake",
  "field-read": "Field Read",
  "live-demo": "Live Demo",
  closing: "Closing",
  debrief: "Debrief",
  disposition: "Disposition",
  recap: "Recap",
};

export function Topbar({
  title = "Axiom Field",
  subtitle,
  status,
}: TopbarProps) {
  const session = useSessionStore((s) => s.session);
  const trend = (session?.signals ?? []).slice(-3);

  const resolvedSubtitle =
    subtitle ??
    (session?.repName
      ? `${session.repName} · ${session.business?.name ?? "New Session"}`
      : "Sales Execution Platform");

  const resolvedStatus = status ?? (session?.phase ? PHASE_LABELS[session.phase] : "Phase V2B");

  const isLive = session?.phase === "live-demo";

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="space-y-1">
          <div className="text-lg font-semibold tracking-tight">{title}</div>
          <div className="text-sm text-muted">{resolvedSubtitle}</div>
        </div>

        <div className="flex items-center gap-3">
          {trend.length > 0 && (
            <div className="flex items-center gap-1">
              {trend.map((s, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-2 w-2 rounded-full",
                    s === "green"
                      ? "bg-signal-green"
                      : s === "yellow"
                      ? "bg-signal-yellow"
                      : "bg-signal-red"
                  )}
                />
              ))}
            </div>
          )}

          <div
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              isLive
                ? "border-signal-green/30 bg-signal-green/10 text-signal-green"
                : "border-border bg-background text-muted"
            )}
          >
            {isLive ? "● Live" : resolvedStatus}
          </div>
        </div>
      </div>
    </header>
  );
}
