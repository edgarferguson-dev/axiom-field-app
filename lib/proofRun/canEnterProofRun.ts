import type { Session } from "@/types/session";
import { diagnoseGaps } from "@/lib/field/gapDiagnosis";

/**
 * Minimum scout truth before starting a Proof Run (name, category, gap diagnosis available or derivable).
 * Neighborhood context is never required.
 */
export function canEnterProofRun(session: Session | null): boolean {
  if (!session?.business) return false;
  const name = session.business.name?.trim();
  const type = session.business.type?.trim();
  if (!name || !type) return false;
  const gaps =
    session.gapDiagnosis ??
    diagnoseGaps(session.business, session.placesPrimaryType ?? undefined);
  return gaps != null && Array.isArray(gaps.gaps);
}

export function proofRunBlockingMessage(): { title: string; body: string } {
  return {
    title: "Scout isn’t ready for Proof Run",
    body: "Add a business name and category, and make sure gap diagnosis is available (lock a brief or pick a Places result).",
  };
}
