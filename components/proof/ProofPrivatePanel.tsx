"use client";

import { useMemo } from "react";
import { useSessionStore } from "@/store/session-store";
import {
  getBlockById,
  getNextProofBlockId,
} from "@/lib/flows/proofEngine";
import type { BuyerReaction } from "@/types/proof";
import { cn } from "@/lib/utils/cn";

const REACTIONS: { value: BuyerReaction; label: string }[] = [
  { value: "positive", label: "Warm" },
  { value: "neutral", label: "OK" },
  { value: "unclear", label: "Mixed" },
  { value: "negative", label: "Cold" },
];

/**
 * Rep-only: why this proof moment matters + fast capture. Compact for tablet.
 */
export function ProofPrivatePanel() {
  const sequence = useSessionStore((s) => s.session?.proofSequence);
  const currentId = useSessionStore((s) => s.session?.currentProofBlockId);
  const events = useSessionStore((s) => s.session?.proofEvents ?? []);
  const markShown = useSessionStore((s) => s.markProofShown);
  const markSkipped = useSessionStore((s) => s.markProofSkipped);
  const markRevisited = useSessionStore((s) => s.markProofRevisited);
  const setReaction = useSessionStore((s) => s.setProofBuyerReaction);
  const setCurrent = useSessionStore((s) => s.setCurrentProofBlock);

  const block = getBlockById(sequence ?? null, currentId ?? null);
  const nextId = getNextProofBlockId(sequence ?? null, currentId ?? null);

  const lastReactionForBlock = useMemo(() => {
    if (!currentId) return null;
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].proofBlockId !== currentId) continue;
      if (events[i].status === "skipped") continue;
      return events[i].buyerReaction;
    }
    return null;
  }, [events, currentId]);

  if (!sequence?.blocks.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 px-3 py-3 text-xs text-muted">
        Proof loads from scout. Finish business context on field-read, then open demo.
      </div>
    );
  }

  return (
    <section
      className="space-y-3 rounded-2xl border border-border bg-card p-3 shadow-soft ring-1 ring-foreground/[0.06] sm:p-4"
      aria-label="Proof coaching"
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Proof moment</p>
        {block ? (
          <>
            <p className="mt-1 text-sm font-semibold text-foreground">{block.title}</p>
            <p className="mt-1 text-xs leading-snug text-muted">{block.objective}</p>
            <p className="mt-2 text-xs leading-relaxed text-foreground/90">{block.internalReason}</p>
          </>
        ) : (
          <p className="mt-1 text-xs text-muted">Select a block on the buyer screen.</p>
        )}
      </div>

      {block && (
        <>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                markShown(block.id);
                if (nextId) setCurrent(nextId);
              }}
              className="min-h-[40px] flex-1 rounded-xl bg-accent px-2 py-2 text-[11px] font-bold uppercase tracking-wide text-white"
            >
              Shown → next
            </button>
            <button
              type="button"
              onClick={() => markSkipped(block.id)}
              className="min-h-[40px] flex-1 rounded-xl border border-border bg-surface px-2 py-2 text-[11px] font-bold uppercase tracking-wide text-muted"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() => markRevisited(block.id)}
              className="min-h-[40px] flex-1 rounded-xl border border-border bg-surface px-2 py-2 text-[11px] font-bold uppercase tracking-wide text-muted"
            >
              Revisit
            </button>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Room</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {REACTIONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReaction(block.id, r.value)}
                  className={cn(
                    "min-h-[36px] min-w-[3.25rem] rounded-lg px-2 text-[11px] font-semibold transition",
                    lastReactionForBlock === r.value
                      ? "bg-foreground text-background"
                      : "bg-surface text-muted hover:text-foreground"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {nextId && (
            <p className="text-[10px] text-muted">
              Next up:{" "}
              <span className="font-medium text-foreground">
                {sequence.blocks.find((b) => b.id === nextId)?.title ?? "—"}
              </span>
            </p>
          )}
        </>
      )}
    </section>
  );
}
