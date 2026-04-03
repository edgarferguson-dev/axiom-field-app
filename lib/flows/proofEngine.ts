import type { Session } from "@/types/session";
import type { MethodContext, ProofPostureWeights } from "@/types/method";
import { getProofPostureWeights } from "@/lib/flows/methodEngine";
import type {
  ProofAssessment,
  ProofBlock,
  ProofBrief,
  ProofEvent,
  ProofSequence,
  ProofType,
  BuyerReaction,
} from "@/types/proof";

/** Internal sequence order (default in-room proof arc). */
export const PROOF_TYPE_ORDER: ProofType[] = [
  "context",
  "pain",
  "mechanism",
  "outcome",
  "credibility",
  "action",
];

/** Buyer-safe section labels — no methodology branding. */
export function buyerFacingHeadline(type: ProofType): string {
  const map: Record<ProofType, string> = {
    context: "The situation",
    pain: "The cost of waiting",
    mechanism: "How it works",
    outcome: "What changes for you",
    credibility: "Why you can rely on this",
    action: "A clear next step",
  };
  return map[type];
}

export function buildProofBrief(session: Session): ProofBrief {
  const b = session.business;
  const intel = session.preCallIntel;
  const gate = session.fieldEngagementDecision;

  const businessContext = b
    ? `${b.name}${b.type ? ` · ${b.type}` : ""}${b.leadSource ? ` · ${b.leadSource}` : ""}`
    : "Prospect (complete business profile to sharpen proof)";

  const likelyTrustBarrier =
    intel?.likelyObjection?.trim() ||
    gate?.reason?.trim() ||
    "Trust and fit still need to be earned in the room.";

  const recommendedProofAngle =
    intel?.recommendedAngle?.trim() ||
    gate?.primaryAngle?.trim() ||
    intel?.painPattern?.trim() ||
    "Anchor on their stated constraints, then show a concrete path.";

  const recommendedSequenceId = `seq-${session.id?.slice(0, 8) ?? "session"}`;

  const rationale =
    gate && intel
      ? `Gate: ${gate.decision}. Lead with ${recommendedProofAngle.slice(0, 120)}`
      : intel
        ? `Intel suggests focusing on pain pattern and missed value before mechanics.`
        : "Limited intel — use a disciplined proof arc and capture reactions as you go.";

  return {
    businessContext,
    likelyTrustBarrier,
    recommendedProofAngle,
    recommendedSequenceId,
    rationale,
  };
}

function makeBlock(
  type: ProofType,
  brief: ProofBrief,
  session: Session,
  index: number
): ProofBlock {
  const b = session.business;
  const intel = session.preCallIntel;
  const name = b?.name ?? "this business";

  const buyerFacingClaim = (() => {
    switch (type) {
      case "context":
        return `Let's anchor on ${name} — how things run today and what a good week actually looks like for you.`;
      case "pain":
        return (
          intel?.painPattern ||
          `The hidden cost isn't the tool — it's leakage, delay, and inconsistency that compounds every week.`
        );
      case "mechanism":
        return `Plain English: a simple loop from interest to booked outcome — fewer handoffs, less chasing, no extra admin theater.`;
      case "outcome":
        return (
          intel?.missedValueEstimate ||
          `The upside is measurable: fewer drop-offs, faster follow-up, and a clearer line of sight on what's working.`
        );
      case "credibility":
        return `You should see this work in a way that fits your floor — not a generic pitch, a relevant pattern.`;
      case "action":
        return `If this matches what you need, the next step is small, reversible, and specific — not a big leap.`;
      default:
        return "";
    }
  })();

  const objective = (() => {
    switch (type) {
      case "context":
        return "Establish shared reality and relevance.";
      case "pain":
        return "Make the cost of inaction vivid and specific.";
      case "mechanism":
        return "Explain how outcomes are produced, simply.";
      case "outcome":
        return "Translate mechanism into tangible results.";
      case "credibility":
        return "Reduce trust risk with relevant proof.";
      case "action":
        return "Make the decision step obvious and safe.";
      default:
        return "";
    }
  })();

  const internalReason = (() => {
    switch (type) {
      case "context":
        return "Locks the conversation to their world — avoids \"software tour\" energy.";
      case "pain":
        return `Addresses likely barrier: ${brief.likelyTrustBarrier.slice(0, 140)}`;
      case "mechanism":
        return "Buyers believe process before they believe promises.";
      case "outcome":
        return "Connects features to numbers or scenarios they respect.";
      case "credibility":
        return "Neutralizes skepticism before you ask.";
      case "action":
        return "Momentum dies without a crisp next move.";
      default:
        return "";
    }
  })();

  const id = `proof-${type}-${index}`;
  const priority = index === 0 ? "primary" : index < 3 ? "primary" : index < 5 ? "secondary" : "fallback";

  return {
    id,
    type,
    title: buyerFacingHeadline(type),
    objective,
    buyerFacingClaim,
    internalReason,
    priority,
    isRequired: type === "pain" || type === "credibility" || type === "action",
  };
}

export function buildDefaultProofSequence(brief: ProofBrief, session: Session): ProofSequence {
  const blocks: ProofBlock[] = PROOF_TYPE_ORDER.map((type, i) => makeBlock(type, brief, session, i));
  const recommendedStartBlockId = blocks[0]?.id ?? "";
  const fallbackBlockIds = blocks.filter((x) => x.priority === "fallback").map((x) => x.id);

  return {
    id: brief.recommendedSequenceId,
    blocks,
    recommendedStartBlockId,
    fallbackBlockIds,
  };
}

export function getBlockById(sequence: ProofSequence | null, id: string | null): ProofBlock | null {
  if (!sequence || !id) return null;
  return sequence.blocks.find((b) => b.id === id) ?? null;
}

/** True if `id` references a block in the active sequence (persisted ids stay valid). */
export function isProofBlockInSequence(sequence: ProofSequence | null, id: string | null): boolean {
  if (!sequence?.blocks.length || !id) return false;
  return sequence.blocks.some((b) => b.id === id);
}

/**
 * Repairs invalid or missing pointers (e.g. stale storage, deep-link edge cases).
 */
export function normalizeCurrentProofBlockId(
  sequence: ProofSequence | null,
  currentId: string | null,
  fallbackId: string
): string {
  if (!sequence?.blocks.length) return fallbackId;
  if (currentId && isProofBlockInSequence(sequence, currentId)) return currentId;
  return fallbackId || sequence.recommendedStartBlockId || sequence.blocks[0]?.id || "";
}

/** Next linear block in the default arc, or null at end. Invalid `currentId` yields null (caller should normalize). */
export function getNextProofBlockId(
  sequence: ProofSequence | null,
  currentId: string | null
): string | null {
  if (!sequence?.blocks.length) return null;
  if (!currentId) return sequence.blocks[0]?.id ?? null;
  const i = sequence.blocks.findIndex((b) => b.id === currentId);
  if (i < 0) return null;
  return sequence.blocks[i + 1]?.id ?? null;
}

export function getPreviousProofBlockId(
  sequence: ProofSequence | null,
  currentId: string | null
): string | null {
  if (!sequence?.blocks.length || !currentId) return null;
  const i = sequence.blocks.findIndex((b) => b.id === currentId);
  if (i <= 0) return null;
  return sequence.blocks[i - 1]?.id ?? null;
}

/** Last proof event for a block (any status), scanning from the end. */
export function lastProofEventForBlock(
  events: ProofEvent[],
  proofBlockId: string
): ProofEvent | null {
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].proofBlockId === proofBlockId) return events[i];
  }
  return null;
}

const REACTION_SCORE: Record<BuyerReaction, number> = {
  positive: 2,
  neutral: 0.5,
  unclear: -0.5,
  negative: -2,
};

function weightForProofType(w: ProofPostureWeights, type: ProofType): number {
  switch (type) {
    case "context":
      return w.contextWeight;
    case "pain":
      return w.painWeight;
    case "mechanism":
      return w.mechanismWeight;
    case "outcome":
      return w.outcomeWeight;
    case "credibility":
      return w.credibilityWeight;
    case "action":
      return w.actionWeight;
    default:
      return 1;
  }
}

function meanProofTypeWeight(w: ProofPostureWeights): number {
  return (
    w.contextWeight +
    w.painWeight +
    w.mechanismWeight +
    w.outcomeWeight +
    w.credibilityWeight +
    w.actionWeight
  ) / 6;
}

/**
 * RFC 4 — posture-aware proof scoring; DaNI (`evidence_arc`) matches legacy numerics (unit weights, sensitivity 1).
 *
 * @param methodContext When omitted, uses DaNI `evidence_arc` weights.
 */
export function deriveProofAssessment(
  sequence: ProofSequence | null,
  events: ProofEvent[],
  methodContext?: MethodContext
): ProofAssessment | null {
  const weights = methodContext
    ? getProofPostureWeights(methodContext.proofPosture)
    : getProofPostureWeights("evidence_arc");
  const meanW = meanProofTypeWeight(weights);

  if (!sequence?.blocks.length) return null;

  const validIds = new Set(sequence.blocks.map((b) => b.id));
  const scoped = events.filter((e) => validIds.has(e.proofBlockId));

  if (events.length > 0 && scoped.length === 0) {
    return {
      proofConfidence: 0,
      unresolvedTrustGap: "Saved proof steps didn’t match this visit’s sequence — log moments again next time.",
    };
  }

  if (scoped.length === 0) {
    return {
      proofConfidence: 0,
      unresolvedTrustGap: "No proof moments were captured on this visit.",
    };
  }

  const byBlock = new Map<string, ProofEvent[]>();
  for (const e of scoped) {
    const list = byBlock.get(e.proofBlockId) ?? [];
    list.push(e);
    byBlock.set(e.proofBlockId, list);
  }

  let strongestProofBlockId: string | undefined;
  let weakestProofBlockId: string | undefined;
  let best = -Infinity;
  let worst = Infinity;

  for (const block of sequence.blocks) {
    const evs = byBlock.get(block.id) ?? [];
    if (evs.length === 0) continue;

    const typeScale = weightForProofType(weights, block.type) / meanW;
    let score = 0;
    for (const e of evs) {
      if (e.status === "skipped") score -= (block.isRequired ? 2 : 0.5) * typeScale;
      else if (e.status === "revisited") score += 0.25 * typeScale;
      else score += (REACTION_SCORE[e.buyerReaction] ?? 0) * typeScale;
    }

    if (score > best) {
      best = score;
      strongestProofBlockId = block.id;
    }
    if (score <= worst) {
      worst = score;
      weakestProofBlockId = block.id;
    }
  }

  const requiredIds = new Set(sequence.blocks.filter((b) => b.isRequired).map((b) => b.id));
  const skippedRequired = Array.from(requiredIds).filter((id) =>
    (byBlock.get(id) ?? []).some((e) => e.status === "skipped")
  );

  let unresolvedTrustGap: string | undefined;
  if (skippedRequired.length) {
    unresolvedTrustGap =
      "A required moment was skipped — before the next visit, decide how you’ll show fit and risk more concretely.";
  } else if (weakestProofBlockId && strongestProofBlockId !== weakestProofBlockId) {
    const wb = sequence.blocks.find((b) => b.id === weakestProofBlockId);
    if (wb?.type === "credibility" || wb?.type === "pain") {
      unresolvedTrustGap = `Hardest pull was ${wb.title.toLowerCase()} — bring one concrete example next time.`;
    }
  }

  const touchedIds = new Set(scoped.map((e) => e.proofBlockId));
  let denomW = 0;
  let numerW = 0;
  for (const b of sequence.blocks) {
    const wt = weightForProofType(weights, b.type);
    denomW += wt;
    if (touchedIds.has(b.id)) numerW += wt;
  }
  const completion = denomW > 0 ? Math.min(1, numerW / denomW) : 0;

  const positive = scoped.filter((e) => e.buyerReaction === "positive").length;
  const negative = scoped.filter((e) => e.buyerReaction === "negative").length;

  const reactionQuality = Math.max(
    0,
    Math.min(
      1,
      0.5 +
        positive * 0.12 * weights.urgencySensitivity -
        negative * 0.15 * weights.trustSensitivity
    )
  );
  const proofConfidence = Math.round(Math.max(0, Math.min(100, completion * 55 + reactionQuality * 45)));

  return {
    strongestProofBlockId,
    weakestProofBlockId,
    unresolvedTrustGap,
    proofConfidence,
  };
}
