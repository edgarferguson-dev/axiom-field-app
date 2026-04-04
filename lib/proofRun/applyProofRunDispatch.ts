import type { PresentationSlide } from "@/lib/flows/presentationEngine";
import type { SlideType } from "@/lib/flows/presentationEngine";
import type {
  ProofRunBeatId,
  ProofRunBeatVisit,
  ProofRunDispatchAction,
  ProofRunRuntimeState,
} from "@/types/proofRun";
import {
  createIdleProofRun,
  proofRunBeatIdFromPhase,
  proofRunPhaseFromSlideIndex,
  slideIndexForProofRunPhase,
} from "@/types/proofRun";

function findSlideIndex(slides: PresentationSlide[], type: SlideType): number {
  const idx = slides.findIndex((s) => s.type === type);
  return idx >= 0 ? idx : -1;
}

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

function applyIndexAndPhase(
  pr: ProofRunRuntimeState,
  newIdx: number,
  slideCount: number,
  now: number,
  slides: PresentationSlide[]
): ProofRunRuntimeState {
  const idx = clampIndex(newIdx, slideCount);
  const newPhase = proofRunPhaseFromSlideIndex(idx);
  const oldBeat = proofRunBeatIdFromPhase(pr.phase);
  const newBeat = proofRunBeatIdFromPhase(newPhase);

  let next = { ...pr, lastSlideIndex: idx, phase: newPhase };

  if (oldBeat !== newBeat) {
    next = closeOpenVisit(next, now);
    if (newBeat) {
      next = openVisit(next, newBeat, now);
    }
  }

  const pi = findSlideIndex(slides, "pricing");
  const hi = findSlideIndex(slides, "health-report-share");
  if (pi >= 0 && idx >= pi) next = { ...next, reachedAsk: true };
  if (hi >= 0 && idx >= hi) next = { ...next, reachedReport: true };

  return next;
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
      const cur = clamp(pr.lastSlideIndex);
      if (cur >= n - 1) {
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
      const pi = findSlideIndex(slides, "pricing");
      const target = pi >= 0 ? pi : clamp(5);
      let next = applyIndexAndPhase(pr, target, n, now, slides);
      next = { ...next, reachedAsk: true, phase: "beat-6" };
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
      const hi = findSlideIndex(slides, "health-report-share");
      const completeIdx = hi >= 0 ? clamp(hi) : clamp(Math.min(6, n - 1));
      next = {
        ...next,
        phase: "complete",
        runCompletedAt: now,
        totalDurationMs:
          next.runStartedAt != null ? Math.max(0, now - next.runStartedAt) : next.totalDurationMs,
        currentBeatEnteredAt: null,
        lastSlideIndex: completeIdx,
        reachedAsk: true,
        reachedReport: hi >= 0 && completeIdx >= hi ? true : next.reachedReport,
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

/** Resolve deck index from phase when hydrating UI. */
export function proofRunSlideIndexForState(pr: ProofRunRuntimeState, slideCount: number): number {
  if (slideCount <= 0) return 0;
  if (pr.phase === "idle") return clampIndex(pr.lastSlideIndex, slideCount);
  return clampIndex(slideIndexForProofRunPhase(pr.phase, slideCount), slideCount);
}
