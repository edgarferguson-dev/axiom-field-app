import type { PresentationSlide } from "@/lib/flows/presentationEngine";
import type {
  ProofRunBeatId,
  ProofRunBeatVisit,
  ProofRunDispatchAction,
  ProofRunRuntimeState,
} from "@/types/proofRun";
import { createIdleProofRun, proofRunBeatIdFromPhase } from "@/types/proofRun";
import {
  mayAutoCompleteProofRunFromLastSlide,
  proofRunPhaseFromDeckIndex,
  slideIndexForAskBeat,
  slideIndexForHealthReportBeat,
  slideIndexForProofRunPhaseInDeck,
} from "@/lib/proofRun/canonicalDeckMapping";

function clampIndex(i: number, slideCount: number): number {
  if (slideCount <= 0) return 0;
  return Math.max(0, Math.min(i, slideCount - 1));
}

function closeOpenVisit(pr: ProofRunRuntimeState, now: number): ProofRunRuntimeState {
  if (pr.visits.length === 0) return { ...pr, currentBeatEnteredAt: null };
  const last = pr.visits[pr.visits.length - 1]!;
  if (last.exitedAt != null) return { ...pr, currentBeatEnteredAt: null };
  const durationMs = Math.max(0, now - last.enteredAt);
  const visits = [...pr.visits.slice(0, -1), { ...last, exitedAt: now, durationMs }];
  return { ...pr, visits, currentBeatEnteredAt: null };
}

function openVisit(pr: ProofRunRuntimeState, beatId: ProofRunBeatId, now: number): ProofRunRuntimeState {
  const closed = closeOpenVisit(pr, now);
  const v: ProofRunBeatVisit = { beatId, enteredAt: now, exitedAt: null, durationMs: null };
  return {
    ...closed,
    visits: [...closed.visits, v],
    currentBeatEnteredAt: now,
  };
}

/** `reachedAsk` / `reachedReport` from canonical phase only (not legacy index rules). */
function withReachedFlags(pr: ProofRunRuntimeState, newPhase: ProofRunPhaseName): ProofRunRuntimeState {
  return {
    ...pr,
    reachedAsk: pr.reachedAsk || newPhase === "beat-5",
    reachedReport: pr.reachedReport || newPhase === "beat-6",
  };
}

type ProofRunPhaseName = ProofRunRuntimeState["phase"];

function applyIndexAndPhase(
  pr: ProofRunRuntimeState,
  newIdx: number,
  slideCount: number,
  now: number,
  slides: PresentationSlide[]
): ProofRunRuntimeState {
  const idx = clampIndex(newIdx, slideCount);
  const newPhase = proofRunPhaseFromDeckIndex(slides, idx);
  const oldBeat = proofRunBeatIdFromPhase(pr.phase);
  const newBeat = proofRunBeatIdFromPhase(newPhase);

  let next: ProofRunRuntimeState = { ...pr, lastSlideIndex: idx, phase: newPhase };

  if (oldBeat !== newBeat) {
    next = closeOpenVisit(next, now);
    if (newBeat) {
      next = openVisit(next, newBeat, now);
    }
  }

  return withReachedFlags(next, newPhase);
}

export function applyProofRunDispatch(args: {
  proofRun: ProofRunRuntimeState;
  action: ProofRunDispatchAction;
  slides: PresentationSlide[];
  now: number;
}): { proofRun: ProofRunRuntimeState; activeSlideIndex: number } {
  const { action, slides, now } = args;
  const pr = args.proofRun;
  const n = slides.length;
  const clamp = (i: number) => clampIndex(i, n);

  switch (action.type) {
    case "mark-report-shared":
      return { proofRun: { ...pr, reportShared: true }, activeSlideIndex: clamp(pr.lastSlideIndex) };

    case "mark-report-texted":
      return { proofRun: { ...pr, reportTextedToOwner: true }, activeSlideIndex: clamp(pr.lastSlideIndex) };

    case "start": {
      let next = createIdleProofRun();
      next = {
        ...next,
        phase: "beat-1",
        runStartedAt: now,
        exitReason: null,
        lastSlideIndex: 0,
      };
      next = openVisit(next, "beat-1", now);
      return { proofRun: next, activeSlideIndex: 0 };
    }

    case "next": {
      if (pr.phase === "idle" || n === 0) return { proofRun: pr, activeSlideIndex: 0 };
      if (pr.runCompletedAt != null) {
        return { proofRun: pr, activeSlideIndex: clamp(pr.lastSlideIndex) };
      }
      const cur = clamp(pr.lastSlideIndex);
      if (cur >= n - 1) {
        if (!mayAutoCompleteProofRunFromLastSlide(slides, cur)) {
          return { proofRun: pr, activeSlideIndex: cur };
        }
        let next = closeOpenVisit(pr, now);
        next = {
          ...next,
          phase: "complete",
          runCompletedAt: now,
          totalDurationMs:
            next.runStartedAt != null ? Math.max(0, now - next.runStartedAt) : next.totalDurationMs,
          currentBeatEnteredAt: null,
          lastSlideIndex: cur,
        };
        next = withReachedFlags(next, "complete");
        return { proofRun: next, activeSlideIndex: cur };
      }
      const newIdx = cur + 1;
      const next = applyIndexAndPhase(pr, newIdx, n, now, slides);
      return { proofRun: next, activeSlideIndex: newIdx };
    }

    case "back": {
      if (pr.phase === "idle" || n === 0) return { proofRun: pr, activeSlideIndex: 0 };
      const cur = clamp(pr.lastSlideIndex);
      const newIdx = clamp(cur - 1);
      const next = applyIndexAndPhase(pr, newIdx, n, now, slides);
      return { proofRun: next, activeSlideIndex: newIdx };
    }

    case "skip-to-ask": {
      const askIdx = slideIndexForAskBeat(slides);
      if (askIdx < 0) {
        return { proofRun: pr, activeSlideIndex: clamp(pr.lastSlideIndex) };
      }
      const target = clamp(askIdx);
      const next = applyIndexAndPhase(pr, target, n, now, slides);
      return { proofRun: next, activeSlideIndex: target };
    }

    case "exit": {
      const closed = closeOpenVisit(pr, now);
      return {
        proofRun: {
          ...closed,
          phase: "idle",
          exitReason: action.reason,
          currentBeatEnteredAt: null,
          lastSlideIndex: 0,
        },
        activeSlideIndex: 0,
      };
    }

    case "complete": {
      let next = closeOpenVisit(pr, now);
      const hi = slideIndexForHealthReportBeat(slides);
      const completeIdx = hi >= 0 ? clamp(hi) : clamp(n - 1);
      next = {
        ...next,
        phase: "complete",
        runCompletedAt: now,
        totalDurationMs:
          next.runStartedAt != null ? Math.max(0, now - next.runStartedAt) : next.totalDurationMs,
        currentBeatEnteredAt: null,
        lastSlideIndex: completeIdx,
        reachedAsk: true,
        reachedReport: hi >= 0 ? true : next.reachedReport,
      };
      return { proofRun: next, activeSlideIndex: completeIdx };
    }

    case "sync-index": {
      if (pr.phase === "idle") {
        return { proofRun: { ...pr, lastSlideIndex: clamp(action.index) }, activeSlideIndex: clamp(action.index) };
      }
      const newIdx = clamp(action.index);
      const next = applyIndexAndPhase(pr, newIdx, n, now, slides);
      return { proofRun: next, activeSlideIndex: newIdx };
    }

    default:
      return { proofRun: pr, activeSlideIndex: clamp(pr.lastSlideIndex) };
  }
}

/**
 * Resolve deck index from persisted phase when hydrating UI (needs concrete slides, not a count).
 */
export function proofRunSlideIndexForState(pr: ProofRunRuntimeState, slides: PresentationSlide[]): number {
  if (slides.length === 0) return 0;
  if (pr.phase === "idle") return clampIndex(pr.lastSlideIndex, slides.length);
  return clampIndex(slideIndexForProofRunPhaseInDeck(slides, pr.phase), slides.length);
}
