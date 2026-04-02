import type { Session } from "@/types/session";

/** Whole minutes between started and completed, or 0 if not available. */
export function sessionDurationMinutes(session: Session | null | undefined): number {
  if (!session?.completedAt || !session?.startedAt) return 0;
  return Math.round((session.completedAt - session.startedAt) / 60000);
}
