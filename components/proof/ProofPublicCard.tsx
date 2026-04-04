"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/session-store";
import { getBlockById, getNextProofBlockId, getPreviousProofBlockId, normalizeCurrentProofBlockId } from "@/lib/flows/proofEngine";
import { ProofProgress } from "@/components/proof/ProofProgress";
import { cn } from "@/lib/utils/cn";

/**
 * Buyer-facing proof moment — evidence-first copy, methodology-neutral.
 */
export function ProofPublicCard({ started }: { started: boolean }) {
  const sequence = useSessionStore((s) => s.session?.proofSequence);
  const currentId = useSessionStore((s) => s.session?.currentProofBlockId);
  const setCurrentProofBlock = useSessionStore((s) => s.setCurrentProofBlock);

  const block = getBlockById(sequence ?? null, currentId ?? null);
  const nextId = getNextProofBlockId(sequence ?? null, currentId ?? null);
  const prevId = getPreviousProofBlockId(sequence ?? null, currentId ?? null);

  const fallbackStart =
    sequence?.recommendedStartBlockId || sequence?.blocks[0]?.id || "";

  useEffect(() => {
    if (!started || !sequence?.blocks.length || !fallbackStart) return;
    const fixed = normalizeCurrentProofBlockId(sequence, currentId ?? null, fallbackStart);
    if (fixed !== currentId) setCurrentProofBlock(fixed);
  }, [started, sequence, currentId, fallbackStart, setCurrentProofBlock]);

  if (!started || !sequence?.blocks.length) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-border/55 bg-gradient-to-b from-card/90 to-card/50 px-5 py-5 shadow-soft ring-1 ring-foreground/[0.05]",
        "backdrop-blur-sm"
      )}
      aria-label="Proof focus for this visit"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Proof focus</p>
          {block ? (
            <>
              <h3 className="text-balance text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {block.title}
              </h3>
              <p className="text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">{block.buyerFacingClaim}</p>
            </>
          ) : (
            <p className="text-sm text-muted">Preparing the next point…</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <ProofProgress sequence={sequence} currentBlockId={currentId} />
        <div className="flex flex-wrap items-center gap-2">
          {prevId && (
            <button
              type="button"
              onClick={() => setCurrentProofBlock(prevId)}
              className="rounded-xl border border-border/80 bg-background px-4 py-2 text-xs font-semibold text-muted transition hover:border-accent/35 hover:text-foreground"
            >
              Back
            </button>
          )}
          {nextId && (
            <button
              type="button"
              onClick={() => setCurrentProofBlock(nextId)}
              className="rounded-xl bg-accent px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Continue
            </button>
          )}
          {!nextId && block && (
            <span className="text-xs font-medium text-muted">You&apos;ve covered the arc — move when the room is ready.</span>
          )}
        </div>
      </div>
    </section>
  );
}
