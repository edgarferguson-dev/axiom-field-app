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

function isSalonFamily(categoryLower: string): boolean {
  return ["barber shop", "beauty salon", "hair salon", "nail salon"].some((c) => categoryLower.includes(c));
}

function primaryPainHeadlineFor(gaps: GapDiagnosis, categoryLower: string): string {
  if (gaps.primaryGap === "low-rating") {
    if (isSalonFamily(categoryLower)) return "Stars and reviews are picking who gets the chair";
    if (categoryLower.includes("cpa") || categoryLower.includes("accounting")) return "Trust signals cost you referrals before you meet anyone";
    if (categoryLower.includes("contractor")) return "Homeowners compare ratings before they call back";
    return "Your Google reputation is doing talking before you do";
  }
  if (isSalonFamily(categoryLower)) return "Rings and DMs slip while you are with a client";
  if (categoryLower.includes("cpa") || categoryLower.includes("accounting")) return "Busy-season inquiries do not wait for your calendar";
  if (categoryLower.includes("contractor")) return "Job-site days bury leads that needed a fast reply";
  return "Response gaps quietly drain the book";
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

  let extras: Omit<PainBriefExtras, "primaryGapShortLabel" | "primaryPainHeadline">;

  if (gaps.primaryGap === "low-rating") {
    if (isSalonFamily(categoryLower)) {
      extras = {
        openingQuestion: "When someone new compares you to the next chair on Google, what do they see first — stars or your work?",
        openingStatement: `Owners here in ${neighborhoodName} are losing fills when the profile looks thin next to 4.5+ spots — I help tighten that story without a lecture.`,
        followUpProbe: "How many no-shows or last-minute cancels felt like they never fully trusted the booking?",
        listenFor: [
          "People screenshot reviews before they walk in",
          "I know we are better than the stars say",
          "We do not ask for reviews enough",
          "Bad reviews from years ago still show up",
        ],
        firstBeatNote: "First proof: comparison beat — before/after response, then reputation strip.",
      };
    } else if (categoryLower.includes("cpa") || categoryLower.includes("accounting")) {
      extras = {
        openingQuestion: "When a referral googles your firm before they call, does the profile match how you actually deliver?",
        openingStatement: `In ${neighborhoodName}, firms lose trust at the search bar — thin reviews or a quiet profile reads as risk before you ever speak.`,
        followUpProbe: "What is the last time a prospect said they picked someone else because of online presence?",
        listenFor: [
          "We live on referrals — Google is not our thing",
          "We are careful about reviews for compliance",
          "Prospects ghost after they look us up",
        ],
        firstBeatNote: "First proof: reputation + response window — keep it concrete, one screen.",
      };
    } else if (categoryLower.includes("contractor")) {
      extras = {
        openingQuestion: "When homeowners are comparing three bids, how often does your star line cost you the callback?",
        openingStatement: `Contractors in ${neighborhoodName} lose the second call when the profile looks stale next to a 4.7 competitor — even when the work is stronger.`,
        followUpProbe: "What job last month felt like you were the better crew but they never returned your message?",
        listenFor: [
          "I am on the truck all day",
          "Reviews are a pain to collect",
          "I know we look weaker online than we are",
        ],
        firstBeatNote: "First proof: missed lead story, then reputation card — tie both to their week.",
      };
    } else {
      extras = {
        openingQuestion: "When customers compare you on Google before they choose, what part of your profile worries you most?",
        openingStatement: `I help ${neighborhoodName} owners close the gap between how good they are and how that shows up in search — without a generic pitch.`,
        followUpProbe: "What would a stronger profile change for you this month — calls, trust, or both?",
        listenFor: [
          "We are underrated online",
          "Competitors look more legit",
          "I do not have time to fix Google",
        ],
        firstBeatNote: "First proof: comparison + one reputation visual — let them name the pain.",
      };
    }
  } else if (gaps.primaryGap === "no-auto-reply") {
    if (isSalonFamily(categoryLower)) {
      extras = {
        openingQuestion: "When someone calls and you're with a client, what happens to that call?",
        openingStatement: `I work with ${categoryLower}s in ${neighborhoodName} so every call still gets a path to book — even when you're mid-service.`,
        followUpProbe: "How many times did that happen this week?",
        listenFor: [
          "I miss calls all the time",
          "People don't leave voicemails",
          "I try to call back but they don't answer",
          "I'm too busy to deal with that",
        ],
        firstBeatNote: "First proof: missed opportunity / comparison beat — anchor on their real week.",
      };
    } else if (categoryLower.includes("cpa") || categoryLower.includes("accounting")) {
      extras = {
        openingQuestion: "During busy season, when a new client calls and you're in a meeting — what happens?",
        openingStatement: `I work with accounting firms in ${neighborhoodName} so new inquiries get a same-day thread — even when you're with a client.`,
        followUpProbe: "How many potential clients reached out last month that you couldn't get back to same-day?",
        listenFor: [
          "We're slammed during season",
          "My receptionist can't catch everything",
          "I lose track of who called",
          "People want immediate answers",
        ],
        firstBeatNote: "First proof: inquiry path — show the leak in their language.",
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
        firstBeatNote: "First proof: missed lead story — job-site context first.",
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
        firstBeatNote: "First proof: comparison or missed-call beat — pick whichever matches what they said.",
      };
    }
  } else {
    extras = {
      openingQuestion: "What happens when a potential customer tries to reach you and you're unavailable?",
      openingStatement: `I help businesses in ${neighborhoodName} tighten how they show up and respond — starting with what costs them the most this week.`,
      followUpProbe: "If you had to name one leak — calls, reviews, or booking — which hits first?",
      listenFor: [
        "I miss calls sometimes",
        "Reviews are not where we want them",
        "Booking is clunky or missing",
      ],
      firstBeatNote: "First proof: let their answer pick the beat — comparison vs impact stat.",
    };
  }

  const primaryGapShortLabel =
    gaps.gaps.find((g) => g.severity === "high")?.label ?? gaps.gaps[0]?.label ?? "Operational gap";
  const primaryPainHeadline = primaryPainHeadlineFor(gaps, categoryLower);

  const fullExtras: PainBriefExtras = {
    ...extras,
    primaryGapShortLabel,
    primaryPainHeadline,
  };

  const competitiveLine =
    n != null
      ? `For context, similar businesses nearby (~½ mi): ${n.totalNearby} in this sample · ${n.withBooking} list a website on Google · ${n.withHighRating} at 4.5+ stars (avg ${n.avgRating.toFixed(1)}★, ~${Math.round(n.avgReviews)} reviews).`
      : "Nearby Maps comparison wasn’t added — opening angles still follow their scout profile and diagnosis.";

  const openerSnippet = fullExtras.openingQuestion.length > 52 ? `${fullExtras.openingQuestion.slice(0, 52)}…` : fullExtras.openingQuestion;

  const intelRaw: Partial<PreCallIntel> = {
    painPattern: fullExtras.openingStatement.slice(0, PRECALL_FIELD_LIMITS.painPattern),
    riskBand: riskFromGaps(gaps),
    missedValueEstimate: `About ${missed} on the table from ~8 missed touches/wk × $${getAvgTicket(scout.type || "")} avg ticket.`,
    keyOpportunities: [
      fullExtras.followUpProbe,
      gaps.gaps[0]?.label ?? "Confirm their busiest window.",
      competitiveLine.slice(0, PRECALL_FIELD_LIMITS.keyOpportunity),
    ],
    recommendedAngle: fullExtras.openingStatement,
    likelyObjection: `If they go flat, return to: "${openerSnippet}" — then one proof slide, not a feature list.`,
    approachTiming: `First 90s: ask the opening question, then stay quiet. Listen for: ${fullExtras.listenFor.slice(0, 2).join("; ")}. Avoid leading with: price before they name the leak.`,
    tabletGuidance: "now" as TabletGuidance,
    channelMode: "tablet-first" as ChannelMode,
  };

  const intel = normalizePreCallIntel(intelRaw);
  if (!intel) {
    throw new Error("painDrivenIntel: normalization failed");
  }

  return { intel, extras: fullExtras };
}
