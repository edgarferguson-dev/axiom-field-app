"use client";

import Link from "next/link";
import { proofRunBlockingMessage } from "@/lib/proofRun/canEnterProofRun";

export function ProofRunEntryGate({ sessionId }: { sessionId: string }) {
  const { title, body } = proofRunBlockingMessage();
  return (
    <div
      className="mb-5 rounded-2xl border border-signal-yellow/30 bg-signal-yellow/5 px-4 py-4 sm:px-5"
      role="status"
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/session/${sessionId}/field-read?mode=scout`}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-accent px-4 text-center text-sm font-semibold text-white no-underline"
        >
          Open Scout
        </Link>
        <Link
          href={`/session/${sessionId}/brief`}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-border bg-card px-4 text-center text-sm font-semibold text-foreground no-underline"
        >
          Open Brief
        </Link>
      </div>
    </div>
  );
}
