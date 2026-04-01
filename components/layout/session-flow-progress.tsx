"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { SessionPresentationState } from "@/types/presentation";
import type { SessionPhase } from "@/types/session";

const END_PHASES: SessionPhase[] = ["recap", "disposition", "debrief", "closing"];

const STEPS = [
  { id: 1, label: "Intelligence", sub: "Pre-call" },
  { id: 2, label: "Presentation", sub: "Story" },
  { id: 3, label: "Proof", sub: "Interactive" },
  { id: 4, label: "Pricing", sub: "Decision" },
  { id: 5, label: "Account", sub: "Close" },
] as const;

export function getSessionFlowStep(
  pathname: string,
  presentation: SessionPresentationState,
  phase?: SessionPhase | null
): number {
  if (phase && END_PHASES.includes(phase)) return 5;
  if (pathname.includes("/recap") || pathname.includes("/disposition")) return 5;
  if (pathname.includes("/field-read")) return 1;
  if (pathname.includes("/demo")) {
    if (presentation.openAccountStarted) return 5;
    if (presentation.pricingAccepted || presentation.pricingResponse === "accept") return 4;
    if (
      presentation.pricingTierId ||
      presentation.pricingResponse === "hesitate" ||
      presentation.pricingResponse === "reject"
    )
      return 4;
    if (presentation.interactiveProof.step === "confirmed") return 3;
    return 2;
  }
  return 1;
}

type SessionFlowProgressProps = {
  presentation: SessionPresentationState;
  phase?: SessionPhase | null;
};

export function SessionFlowProgress({ presentation, phase }: SessionFlowProgressProps) {
  const pathname = usePathname();
  const current = useMemo(
    () => getSessionFlowStep(pathname, presentation, phase),
    [pathname, presentation, phase]
  );

  return (
    <div className="border-b border-border bg-surface/80 backdrop-blur-sm">
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
                      isActive &&
                        "border-accent bg-accent text-white shadow-glow",
                      isComplete &&
                        "border-signal-green bg-signal-green/10 text-signal-green",
                      !isActive &&
                        !isComplete &&
                        "border-border bg-card text-muted"
                    )}
                  >
                    {isComplete ? (
                      <svg
                        className="h-3 w-3 sm:h-4 sm:w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="hidden min-w-0 sm:block">
                    <div
                      className={cn(
                        "text-xs font-medium leading-tight sm:text-sm",
                        isActive ? "text-foreground" : isComplete ? "text-signal-green" : "text-muted"
                      )}
                    >
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
