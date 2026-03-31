import type { SessionPhase } from "@/types/session";
import { cn } from "@/lib/utils/cn";

const PHASES: SessionPhase[] = ["snapshot", "simulation", "activation"];

type ProgressHeaderProps = {
  currentPhase: SessionPhase;
};

function getLabel(phase: SessionPhase) {
  switch (phase) {
    case "snapshot":
      return "Snapshot";
    case "simulation":
      return "Simulation";
    case "activation":
      return "Activation";
    default:
      return phase;
  }
}

export function ProgressHeader({ currentPhase }: ProgressHeaderProps) {
  const currentIndex = PHASES.indexOf(currentPhase);

  return (
    <div className="border-b border-border bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
        {PHASES.map((phase, index) => {
          const isActive = phase === currentPhase;
          const isComplete = index < currentIndex;

          return (
            <div key={phase} className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium transition",
                    isActive && "border-accent bg-accent text-black",
                    isComplete && "border-signal-green bg-signal-green text-black",
                    !isActive &&
                      !isComplete &&
                      "border-border bg-card text-muted"
                  )}
                >
                  {index + 1}
                </div>

                <div className="min-w-[90px]">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      isActive || isComplete ? "text-foreground" : "text-muted"
                    )}
                  >
                    {getLabel(phase)}
                  </div>
                </div>
              </div>

              {index < PHASES.length - 1 && (
                <div className="h-px w-10 bg-border md:w-16" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
