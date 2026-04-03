"use client";

import { usePathname } from "next/navigation";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";
import { AxiomFieldLogo } from "@/components/branding/AxiomFieldLogo";

type TopbarProps = {
  title?: string;
  subtitle?: string;
  /** Overrides session phase in the status pill (e.g. home: "Ready") */
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
  status: statusOverride,
}: TopbarProps) {
  const pathname = usePathname();
  const session = useSessionStore((s) => s.session);
  const trend = (session?.signals ?? []).slice(-3);

  const resolvedSubtitle =
    subtitle ??
    (session?.repName
      ? `${session.repName} · ${session.business?.name ?? "New Session"}`
      : "Scout → proof → decision");

  const onDemoRoute = pathname.includes("/demo");
  const phase = session?.phase;
  const phaseLabel =
    phase && phase in PHASE_LABELS
      ? PHASE_LABELS[phase as keyof typeof PHASE_LABELS]
      : phase ?? "Active";
  const showLiveBadge =
    !statusOverride && (phase === "live-demo" || onDemoRoute);
  const badgeLabel = statusOverride ?? (showLiveBadge ? "Live" : phaseLabel);
  const showSignalTrend = trend.length > 0 && !onDemoRoute;

  return (
    <header
      className={cn(
        "border-b backdrop-blur-sm",
        onDemoRoute
          ? "border-border/30 bg-background/85 py-2.5 shadow-none"
          : "border-border bg-surface/95 py-4 shadow-sm"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4">
        <div className={cn("flex min-w-0 items-center gap-3", onDemoRoute ? "gap-2" : "gap-3")}>
          <AxiomFieldLogo
            compact={onDemoRoute}
            size={onDemoRoute ? "sm" : "md"}
            className={cn("hidden shrink-0 sm:flex", !onDemoRoute && "sm:items-center")}
          />
          <div className={cn("min-w-0", onDemoRoute ? "space-y-0" : "space-y-1")}>
            <div
              className={cn(
                "font-semibold tracking-tight text-foreground",
                onDemoRoute ? "text-sm" : "text-lg"
              )}
            >
              {title}
            </div>
            {!onDemoRoute && <div className="truncate text-sm text-muted">{resolvedSubtitle}</div>}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          {showSignalTrend && (
            <div className="flex items-center gap-1" aria-label="Recent signal trend">
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
              "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide sm:px-3 sm:py-1 sm:text-xs",
              showLiveBadge
                ? "border-signal-green/35 bg-signal-green/10 text-signal-green"
                : "border-border bg-background text-muted"
            )}
          >
            {badgeLabel}
          </div>
        </div>
      </div>
    </header>
  );
}
