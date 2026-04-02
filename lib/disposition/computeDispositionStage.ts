import type { Session, PerformanceScore } from "@/types/session";
import type { DispositionResult } from "@/types/disposition";
import { runDisposition } from "@/lib/flows/dispositionEngine";
import { calculateScore } from "@/lib/flows/scoringEngine";

export function computeDispositionStage(session: Session | null): {
  result: DispositionResult | null;
  score: PerformanceScore | null;
} {
  if (!session) {
    return { result: null, score: null };
  }
  return {
    result: runDisposition(session),
    score: calculateScore(session),
  };
}
