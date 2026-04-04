import type { BusinessProfile } from "@/types/session";
import type { PreCallIntel, RiskBand, TabletGuidance, ChannelMode } from "@/types/pre-call";
import type { GapDiagnosis, NeighborhoodComparison, PainBriefExtras } from "@/types/scoutIntel";
import { extractNeighborhood } from "@/lib/field/extractNeighborhood";
import { getAvgTicket } from "@/lib/field/gapDiagnosis";
import { normalizePreCallIntel, PRECALL_FIELD_LIMITS } from "@/lib/pre-call/normalizer";

function riskFromGaps(gaps: GapDiagnosis): RiskBand {
  const hasHigh = gaps.gaps.some((g) => g.severity === "high");
  if (hasHigh) return "high";
  if (gaps.gaps.some((g) => g.severity === "medium")) return "medium";
  return "low";
}

/**
 * Template-based pre-call intel (no AI). Maps primary gap + category to opener / probes.
 */
export function generatePainDrivenPreCall(
  scout: BusinessProfile,
  gaps: GapDiagnosis,
  neighborhood: NeighborhoodComparison | null
): { intel: PreCallIntel; extras: PainBriefExtras } {
  const neighborhoodName = extractNeighborhood(scout.address);
  const categoryLower = (scout.type || "").trim().toLowerCase();
  const missed = `~$${gaps.estimatedMonthlyLeakage.toLocaleString()}/mo`;
  const n = neighborhood;

  let extras: PainBriefExtras;

  if (gaps.primaryGap === "no-auto-reply") {
    if (["barber shop", "beauty salon", "hair salon", "nail salon"].some((c) => categoryLower.includes(c))) {
      extras = {
        openingQuestion: "When someone calls and you're with a client, what happens to that call?",
        openingStatement: `I work with ${categoryLower}s in ${neighborhoodName} to make sure every call turns into a booked appointment — even when you're busy.`,
        followUpProbe: "How many times did that happen this week?",
        listenFor: [
          "I miss calls all the time",
          "People don't leave voicemails",
          "I try to call back but they don't answer",
          "I'm too busy to deal with that",
        ],
        firstBeatNote: "Primary pain: missed calls — start with Missed Opportunity beat.",
      };
    } else if (categoryLower.includes("cpa") || categoryLower.includes("accounting")) {
      extras = {
        openingQuestion: "During busy season, when a new client calls and you're in a meeting — what happens?",
        openingStatement: `I work with accounting firms in ${neighborhoodName} to make sure every new inquiry gets a response — even when you're with a client.`,
        followUpProbe: "How many potential clients reached out last month that you couldn't get back to same-day?",
        listenFor: [
          "We're slammed during season",
          "My receptionist can't catch everything",
          "I lose track of who called",
          "People want immediate answers",
        ],
        firstBeatNote: "Primary pain: missed inquiries.",
      };
    } else if (categoryLower.includes("contractor")) {
      extras = {
        openingQuestion: "When you're on a job site and your phone rings — what usually happens?",
        openingStatement: `I help contractors in ${neighborhoodName} make sure every lead gets a response — even when you're on a roof or under a sink.`,
        followUpProbe: "What happens when someone calls 3 contractors and you're the one who doesn't pick up?",
        listenFor: [
          "I'm on job sites all day",
          "I call back when I can",
          "I know I lose jobs from missed calls",
          "My wife handles calls but not always",
        ],
        firstBeatNote: "Primary pain: missed leads from job sites.",
      };
    } else {
      extras = {
        openingQuestion: "What happens when a potential customer tries to reach you and you're unavailable?",
        openingStatement: `I help businesses in ${neighborhoodName} make sure they never miss a customer — even when they're busy.`,
        followUpProbe: "How often does that happen in a typical week?",
        listenFor: [
          "I miss calls sometimes",
          "I try to get back to people",
          "I know I'm leaving money on the table",
        ],
        firstBeatNote: "Primary pain: missed opportunities.",
      };
    }
  } else {
    extras = {
      openingQuestion: "What happens when a potential customer tries to reach you and you're unavailable?",
      openingStatement: `I help businesses in ${neighborhoodName} make sure they never miss a customer — even when they're busy.`,
      followUpProbe: "How often does that happen in a typical week?",
      listenFor: [
        "I miss calls sometimes",
        "I try to get back to people",
        "I know I'm leaving money on the table",
      ],
      firstBeatNote: "Primary pain: reputation + response window.",
    };
  }

  const competitiveLine =
    n != null
      ? `${n.totalNearby} similar businesses within ~0.5 mi · ${n.withBooking} show online booking · ${n.withHighRating} at 4.5+ stars (avg ${n.avgRating.toFixed(1)}★, ~${Math.round(n.avgReviews)} reviews).`
      : "Pull neighborhood stats after Places scout — competitive block fills in automatically.";

  const intelRaw: Partial<PreCallIntel> = {
    painPattern: extras.openingStatement.slice(0, PRECALL_FIELD_LIMITS.painPattern),
    riskBand: riskFromGaps(gaps),
    missedValueEstimate: `About ${missed} on the table from ~8 missed touches/wk × $${getAvgTicket(scout.type || "")} avg ticket.`,
    keyOpportunities: [
      extras.followUpProbe,
      gaps.gaps[0]?.label ?? "Confirm their busiest window.",
      competitiveLine.slice(0, PRECALL_FIELD_LIMITS.keyOpportunity),
    ],
    recommendedAngle: extras.openingStatement,
    likelyObjection: `Time and trust — "we already have something." Counter: anchor on ${gaps.primaryGap === "low-rating" ? "reviews + response" : "missed calls + first reply"}.`,
    approachTiming: `First 90s: ask "${extras.openingQuestion}" then stay quiet. Listen for: ${extras.listenFor.slice(0, 2).join("; ")}. Avoid leading with: pricing before they name the leak.`,
    tabletGuidance: "now" as TabletGuidance,
    channelMode: "tablet-first" as ChannelMode,
  };

  const intel = normalizePreCallIntel(intelRaw);
  if (!intel) {
    throw new Error("painDrivenIntel: normalization failed");
  }

  return { intel, extras };
}
