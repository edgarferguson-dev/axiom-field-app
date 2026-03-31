import type { SessionPhase } from "@/types/session";
import { cn } from "@/lib/utils/cn";

const PHASES: { key: SessionPhase; label: string; sub: string }[] = [
  { key: "pre-call", label: "Pre-Call", sub: "Intelligence" },
  { key: "live-demo", label: "Live Demo", sub: "Coaching" },
  { key: "debrief", label: "Debrief", sub: "Performance" },
];

type ProgressHeaderProps = {
  currentPhase: SessionPhase;
};

export function ProgressHeader({ currentPhase }: ProgressHeaderProps) {
  const currentIndex = PHASES.findIndex((p) => p.key === currentPhase);

  return (
    <div className="border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-4">
        {PHASES.map((phase, index) => {
          const isActive = phase.key === currentPhase;
          const isComplete = index < currentIndex;

          return (
            <div key={phase.key} className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Step indicator */}
                <div
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300",
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
                      className="h-4 w-4"
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
                    index + 1
                  )}
                </div>

                {/* Labels — hide sub on mobile */}
                <div className="hidden sm:block">
                  <div
                    className={cn(
                      "text-sm font-medium leading-tight",
                      isActive ? "text-foreground" : isComplete ? "text-signal-green" : "text-muted"
                    )}
                  >
                    {phase.label}
                  </div>
                  <div className="text-xs text-muted">{phase.sub}</div>
                </div>
              </div>

              {/* Connector */}
              {index < PHASES.length - 1 && (
                <div
                  className={cn(
                    "h-px w-6 transition-colors duration-300 sm:w-12",
                    isComplete ? "bg-signal-green/40" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}

        {/* Right side: live indicator when in demo */}
        {currentPhase === "live-demo" && (
          <div className="ml-auto flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-green opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-signal-green" />
            </span>
            <span className="text-xs font-medium text-signal-green">LIVE</span>
          </div>
        )}
      </div>
    </div>
  );
}
