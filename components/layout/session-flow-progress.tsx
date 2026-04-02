"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
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
  if (pathname.includes("/demo") || phase === "live-demo") return 3;
  if (pathname.includes("/constraints") || phase === "constraints") return 2;
  if (pathname.includes("/field-read") || phase === "field-read") {
    return preCallIntelReady ? 2 : 1;
  }
  return 1;
}

type SessionFlowProgressProps = {
  presentation: SessionPresentationState;
  phase?: SessionPhase | null;
  preCallIntelReady?: boolean;
};

export function SessionFlowProgress({
  presentation,
  phase,
  preCallIntelReady,
}: SessionFlowProgressProps) {
  const pathname = usePathname();
  const current = useMemo(
    () => getSessionFlowStep(pathname, presentation, phase, preCallIntelReady),
    [pathname, presentation, phase, preCallIntelReady]
  );

  return (
    <div className="border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-y-2 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto sm:gap-2">
          {STEPS.map((step, index) => {
            const isActive = current === step.id;
            const isComplete = current > step.id;

            return (
              <div key={step.id} className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div
                    className={cn(
                      "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition-all duration-300 sm:h-8 sm:w-8 sm:text-xs",
                      isActive && "border-accent bg-accent text-white shadow-glow",
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
