"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { SessionPresentationState } from "@/types/presentation";
import type { SessionPhase } from "@/types/session";

const STEPS = [
  { id: 1, label: "Scout",     sub: "Pre-call" },
  { id: 2, label: "Diagnose",  sub: "Constraints" },
  { id: 3, label: "Prove",     sub: "Live demo" },
  { id: 4, label: "Close",     sub: "Offer + close" },
  { id: 5, label: "Record",    sub: "Recap" },
] as const;

export function getSessionFlowStep(
  pathname: string,
  _presentation: SessionPresentationState | null | undefined,
  phase?: SessionPhase | null,
  /** When scout step already has generated intel (constraints captured there too). */
  preCallIntelReady?: boolean
): number {
  if (pathname.includes("/recap") || phase === "recap") return 5;
  if (pathname.includes("/disposition") || phase === "disposition") return 5;
  if (pathname.includes("/close") || phase === "closing") return 4;
  if (pathname.includes("/offer-fit") || phase === "offer-fit") return 4;
  if (pathname.includes("/health-report")) return 4;
  if (pathname.includes("/demo") || phase === "live-demo") return 3;
  if (pathname.includes("/brief")) return preCallIntelReady ? 2 : 1;
  if (pathname.includes("/constraints") || phase === "constraints") return 2;
  if (pathname.includes("/field-read") || phase === "field-read") {
    return preCallIntelReady ? 2 : 1;
  }
  return 1;
}

type SessionFlowProgressProps = {
  sessionId?: string;
  /** Highest step (1–5) the rep may navigate back to; forward jumps stay disabled. */
  flowMaxStep?: number;
  presentation: SessionPresentationState;
  phase?: SessionPhase | null;
  preCallIntelReady?: boolean;
};

function stepHref(sessionId: string, stepId: number): string {
  const base = `/session/${sessionId}`;
  switch (stepId) {
    case 1:
      return `${base}/field-read`;
    case 2:
      return `${base}/constraints`;
    case 3:
      return `${base}/demo`;
    case 4:
      return `${base}/offer-fit`;
    case 5:
      return `${base}/recap`;
    default:
      return base;
  }
}

export function SessionFlowProgress({
  sessionId,
  flowMaxStep = 1,
  presentation,
  phase,
  preCallIntelReady,
}: SessionFlowProgressProps) {
  const pathname = usePathname();
  const router = useRouter();
  const current = useMemo(
    () => getSessionFlowStep(pathname, presentation, phase, preCallIntelReady),
    [pathname, presentation, phase, preCallIntelReady]
  );

  const onDemoRoute = pathname.includes("/demo");
  const progressPct = Math.round((current / STEPS.length) * 100);

  if (onDemoRoute) {
    return (
      <div className="border-b border-border/25 bg-transparent">
        <div className="mx-auto max-w-7xl px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-border/80">
              <div
                className="h-full rounded-full bg-accent/50 transition-[width] duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
              Visit · Prove
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border/60 bg-background/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-y-2 px-4 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto sm:gap-2">
          {STEPS.map((step, index) => {
            const isActive = current === step.id;
            const isComplete = current > step.id;
            const canLoopBack =
              !!sessionId && step.id < current && step.id <= flowMaxStep;

            return (
              <div key={step.id} className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {canLoopBack ? (
                    <button
                      type="button"
                      onClick={() => router.push(stepHref(sessionId!, step.id))}
                      className={cn(
                        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition-all duration-300 sm:h-8 sm:w-8 sm:text-xs",
                        "hover:border-accent/50 hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                        isActive && "border-accent bg-accent text-white shadow-soft",
                        isComplete && "border-signal-green bg-signal-green/10 text-signal-green",
                        !isActive && !isComplete && "border-border bg-card text-muted"
                      )}
                      aria-label={`Go to ${step.label}`}
                    >
                      {isComplete ? (
                        <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.id
                      )}
                    </button>
                  ) : (
                    <div
                      className={cn(
                        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition-all duration-300 sm:h-8 sm:w-8 sm:text-xs",
                        isActive && "border-accent bg-accent text-white shadow-soft",
                        isComplete && "border-signal-green bg-signal-green/10 text-signal-green",
                        !isActive && !isComplete && "border-border bg-card text-muted"
                      )}
                    >
                      {isComplete ? (
                        <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.id
                      )}
                    </div>
                  )}
                  <div className="hidden min-w-0 sm:block">
                    <div className={cn(
                      "text-xs font-medium leading-tight sm:text-sm",
                      isActive ? "text-foreground" : isComplete ? "text-signal-green" : "text-muted"
                    )}>
                      {step.label}
                    </div>
                    <div className="text-[10px] text-muted sm:text-xs">{step.sub}</div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-px w-3 shrink-0 transition-colors duration-300 sm:w-8",
                      isComplete ? "bg-signal-green/40" : "bg-border"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
