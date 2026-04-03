"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ObjectionInterruptContent } from "@/lib/flows/objectionInterrupt";
import { cn } from "@/lib/utils/cn";

type ObjectionInterruptOverlayProps = {
  open: boolean;
  content: ObjectionInterruptContent;
  onResolved: () => void;
  className?: string;
};

export function ObjectionInterruptOverlay({
  open,
  content,
  onResolved,
  className,
}: ObjectionInterruptOverlayProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="objection-interrupt-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4",
            className
          )}
        >
          <button
            type="button"
            aria-label="Dismiss overlay"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
            onClick={onResolved}
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-amber-500/35 bg-card p-4 shadow-xl"
          >
            <h3 id="objection-interrupt-title" className="text-sm font-bold text-foreground">
              Objection
            </h3>
            <div className="mt-3 space-y-2.5 text-[12px] leading-snug">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">They say</p>
                <p className="mt-1 font-medium text-foreground">{content.likelyObjection}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">You</p>
                <p className="mt-1 text-foreground">{content.response}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Then</p>
                <p className="mt-1 text-foreground">{content.regainQuestion}</p>
              </div>
              <div className="rounded-lg border border-red-500/25 bg-red-500/[0.06] px-2.5 py-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-red-900">Never</p>
                <p className="mt-1 text-[12px] leading-snug text-red-950">{content.avoidMistake}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onResolved}
              className="mt-3 w-full min-h-[44px] rounded-xl bg-accent py-2.5 text-sm font-bold text-white shadow-sm active:scale-[0.99] transition hover:opacity-95"
            >
              Done
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
