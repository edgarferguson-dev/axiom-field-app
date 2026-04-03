"use client";

import { cn } from "@/lib/utils/cn";
import type { ProofSequence } from "@/types/proof";

type ProofProgressProps = {
  sequence: ProofSequence | null | undefined;
  currentBlockId: string | null | undefined;
  className?: string;
};

/** Subtle step indicator — no internal type labels on the buyer side. */
export function ProofProgress({ sequence, currentBlockId, className }: ProofProgressProps) {
  if (!sequence?.blocks.length) return null;
  const idx = sequence.blocks.findIndex((b) => b.id === currentBlockId);
  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-hidden>
      {sequence.blocks.map((b, i) => (
        <span
          key={b.id}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === idx ? "w-6 bg-accent" : i < idx ? "w-1.5 bg-accent/45" : "w-1.5 bg-border"
          )}
        />
      ))}
    </div>
  );
}
