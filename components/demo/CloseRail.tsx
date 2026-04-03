"use client";

import { motion } from "framer-motion";
import { DEMO_CLOSE_STATES, type DemoCloseState } from "@/types/session";
import { cn } from "@/lib/utils/cn";

const LABEL: Record<DemoCloseState, string> = {
  hook: "Hook",
  pain: "Pain",
  proof: "Proof",
  ask: "Ask",
  close: "Close",
};

type CloseRailProps = {
  current: DemoCloseState;
  onStepChange: (step: DemoCloseState) => void;
  onAdvance: () => void;
  className?: string;
};

export function CloseRail({ current, onStepChange, onAdvance, className }: CloseRailProps) {
  const idx = DEMO_CLOSE_STATES.indexOf(current);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Close</p>
        <button
          type="button"
          onClick={onAdvance}
          className="min-h-[36px] min-w-[4.5rem] rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-bold text-foreground active:scale-[0.98] transition hover:border-accent/40"
        >
          Next
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        {DEMO_CLOSE_STATES.map((step, i) => {
          const active = step === current;
          return (
            <motion.button
              key={step}
              type="button"
              initial={false}
              animate={{
                scale: active ? 1.03 : 1,
                opacity: active ? 1 : 0.75,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
              onClick={() => onStepChange(step)}
              className={cn(
                "min-h-[40px] min-w-[3.25rem] flex-1 rounded-lg border px-2 py-1.5 text-center text-[11px] font-bold leading-tight transition-colors sm:min-w-0 sm:flex-initial",
                active
                  ? "border-accent bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgba(59,130,246,0.25)]"
                  : "border-border/60 bg-surface/50 text-muted-foreground active:bg-surface"
              )}
            >
              <span className="block text-[9px] font-semibold tabular-nums text-muted">{i + 1}</span>
              <span className="block">{LABEL[step]}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={false}
          animate={{ width: `${((idx + 1) / DEMO_CLOSE_STATES.length) * 100}%` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
