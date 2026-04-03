"use client";

import { motion } from "framer-motion";
import type { FieldEngagementDecision } from "@/types/session";
import { cn } from "@/lib/utils/cn";

const DECISION_STYLES: Record<
  FieldEngagementDecision["decision"],
  { label: string; ring: string; glow: string; badge: string }
> = {
  GO: {
    label: "GO",
    ring: "border-emerald-500/45",
    glow: "shadow-[0_0_28px_-4px_rgba(34,197,94,0.45)]",
    badge: "bg-emerald-500/15 text-emerald-800 border-emerald-500/35",
  },
  SOFT_GO: {
    label: "SOFT GO",
    ring: "border-amber-400/55",
    glow: "shadow-[0_0_22px_-6px_rgba(245,158,11,0.4)]",
    badge: "bg-amber-400/20 text-amber-950 border-amber-500/40",
  },
  WALK: {
    label: "WALK",
    ring: "border-red-500/45",
    glow: "shadow-[0_0_24px_-4px_rgba(239,68,68,0.38)]",
    badge: "bg-red-500/12 text-red-900 border-red-500/35",
  },
};

type DecisionCardProps = {
  gate: FieldEngagementDecision;
  className?: string;
};

export function DecisionCard({ gate, className }: DecisionCardProps) {
  const styles = DECISION_STYLES[gate.decision];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-2xl border-2 bg-card/95 p-4 sm:p-5",
        styles.ring,
        styles.glow,
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            Decision gate
          </p>
          <p className={cn("mt-2 inline-flex rounded-lg border px-3 py-1.5 text-lg font-bold tracking-tight", styles.badge)}>
            {styles.label}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Confidence</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{gate.confidence}%</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium leading-snug text-foreground">{gate.reason}</p>
        <div className="mt-4 rounded-xl border border-border/80 bg-slate-50/80 px-3.5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Primary angle</p>
        <p className="mt-1.5 text-sm leading-snug text-foreground">{gate.primaryAngle}</p>
      </div>
    </motion.div>
  );
}
