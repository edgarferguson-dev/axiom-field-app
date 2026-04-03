"use client";

import { motion } from "framer-motion";
import type { CloseTacticalBlock } from "@/lib/flows/closeTacticalLines";
import { cn } from "@/lib/utils/cn";

type CloseTacticalCardProps = {
  /** Stable step id for motion — avoids re-keying on copy churn */
  stepKey: string;
  block: CloseTacticalBlock;
  className?: string;
  /** DaNI: one line next move only. */
  compact?: boolean;
};

export function CloseTacticalCard({ stepKey, block, className, compact = false }: CloseTacticalCardProps) {
  if (compact) {
    return (
      <div className={cn("rounded-xl border border-border bg-card px-3 py-2", className)}>
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Then</p>
        <p className="mt-0.5 text-sm font-semibold leading-snug text-foreground line-clamp-2">{block.nextMove}</p>
      </div>
    );
  }

  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-xl border border-border bg-card p-2.5 shadow-sm sm:p-3",
        className
      )}
    >
      <dl className="space-y-2 text-[12px] leading-snug text-foreground">
        <div>
          <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Focus</dt>
          <dd className="mt-0.5 font-semibold">{block.focus}</dd>
        </div>
        <div>
          <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-800">Do</dt>
          <dd className="mt-0.5 text-foreground/95">{block.whatToDo}</dd>
        </div>
        <div>
          <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-red-800/90">Skip</dt>
          <dd className="mt-0.5 text-foreground/90">{block.whatToAvoid}</dd>
        </div>
        <div className="border-t border-border/50 pt-2">
          <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-accent">Then</dt>
          <dd className="mt-0.5 font-semibold text-foreground">{block.nextMove}</dd>
        </div>
      </dl>
    </motion.div>
  );
}
