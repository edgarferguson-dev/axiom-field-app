import type { BusinessProfile, PreCallIntel } from "@/types/session";
import type { PresentationSlide, StrategyPackage } from "@/lib/flows/presentationEngine";
import type { PresentationPackDefinition } from "@/lib/presentation/packs/registry";
import type { MerchantProofBeatCue } from "@/types/merchantProof";
import type { OpeningMode } from "@/types/presentationPack";
import type { PricingTier } from "@/lib/flows/presentationEngine";
import type { OfferTemplate } from "@/types/offerTemplate";
import {
  appointmentVenuePhrase,
  inquiryVenuePhrase,
  merchantPlaceHint,
  merchantShortName,
} from "@/lib/presentation/merchantContext";

/** Builder context — same shape as generateProofLedSlides BuildCtx */
export type MerchantBuildCtx = {
  idPrefix: string;
  business: BusinessProfile;
  strategy: StrategyPackage;
  intel: PreCallIntel | null | undefined;
  pack: PresentationPackDefinition;
};

function cue(base: Omit<MerchantProofBeatCue, "beatId"> & { beatId: string }): MerchantProofBeatCue {
  return base;
}

type Snap = Omit<Extract<PresentationSlide, { type: "proof-snapshot" }>, "id">;
type Cmp = Omit<Extract<PresentationSlide, { type: "comparison-proof" }>, "id">;
type Flow = Omit<Extract<PresentationSlide, { type: "mock-flow" }>, "id">;
type Imp = Omit<Extract<PresentationSlide, { type: "impact-stat" }>, "id">;
type Dec = Omit<Extract<PresentationSlide, { type: "decision-next" }>, "id">;
type Pri = Omit<Extract<PresentationSlide, { type: "pricing" }>, "id">;
type Act = Omit<Extract<PresentationSlide, { type: "presentation-actions" }>, "id">;

/** Appointment / neighborhood service — chairs, tables, calendars */
export function buildAppointmentProofSnapshot(ctx: MerchantBuildCtx): Snap {
  const n = merchantShortName(ctx.business);
  const venue = appointmentVenuePhrase(ctx.business.type);
  const block = merchantPlaceHint(ctx.business);
  const local = block ? `Near ${block} — ` : "";
  return {
    type: "proof-snapshot",
    kicker: "Proof",
    title: `${local}After-hours texts still get answered — that’s how ${n} fills ${venue}`,
    subtitle: "What the customer sees on their phone tonight",
    takeaway: "They should picture tomorrow’s book, not our product.",
    proofLabel: "First touch lands while intent is hot — same strip, same chairs.",
    assetKey: "svc-response-grid",
    merchantVisual: "sms-booking-thread",
    conversation: cue({
      beatId: "appt-snapshot",
      proofPurpose: "They admit texts sit — that’s the hook for everything after.",
      openingQuestion: "When someone messages after you’re slammed, what usually happens before anyone sees it?",
      reactionProbe: "Where do those threads usually die — tonight or tomorrow morning?",
      silenceCue: "Let them say it messy. Don’t fix their words with features.",
      privateCoachCue: "Chin toward them — phone screen is evidence, not a script.",
      positiveSignalCue: "If they get specific about nights or weekends — shorten your next sentence.",
      hesitationCue: "If they go flat or fold arms — one beat only, no second story.",
      transitionTrigger: "They nod, shrug, or name a person — you advance.",
      transitionIntent: "ask_question",
    }),
  };
}

export function buildAppointmentComparison(ctx: MerchantBuildCtx): Cmp {
  const venue = appointmentVenuePhrase(ctx.business.type);
  return {
    type: "comparison-proof",
    kicker: "Proof",
    title: `Same week at ${merchantShortName(ctx.business)} — two ${venue} outcomes`,
    subtitle: "What changes when the first touch doesn’t wait on a human",
    takeaway: "They should feel empty slots vs full rows in their own words.",
    before: {
      headline: "Gaps & ghosts",
      detail: "Open times while texts wait — no-shows don’t get rescued.",
    },
    after: {
      headline: "Held seats",
      detail: "First reply books the slot — calendar fills without extra staff.",
    },
    assetKey: "svc-before-after",
    merchantVisual: "compare-no-show-vs-booked",
    conversation: cue({
      beatId: "appt-compare",
      proofPurpose: "They tie slow reply to empty chair time.",
      openingQuestion: "Where do you feel the leak first — the book or the inbox?",
      reactionProbe: "One word — busy, chaos, or blind spots?",
      silenceCue: "After they pick, don’t stack a second story. Breathe.",
      privateCoachCue: "Point at the red column, then stop talking.",
      transitionTrigger: "They own a cost word — time, money, or stress.",
      transitionIntent: "hold_silence",
    }),
  };
}

export function buildAppointmentMockFlow(ctx: MerchantBuildCtx): Flow {
  const n = merchantShortName(ctx.business);
  return {
    type: "mock-flow",
    kicker: "Proof",
    title: `What “always on” could look like at ${n}`,
    subtitle: "Three beats — no dashboard, no feature tour",
    takeaway: "If they can repeat the loop, they already believe it.",
    steps: [
      { id: "1", label: "Text hits", hint: "Friday night counts" },
      { id: "2", label: "Instant hold", hint: "They pick the slot" },
      { id: "3", label: "Book locks", hint: "Reminder without nagging" },
    ],
    assetKey: "svc-automation-3",
    merchantVisual: "booking-automation-flow",
    conversation: cue({
      beatId: "appt-flow",
      proofPurpose: "They see automation as relief, not replacement.",
      openingQuestion: "Who touches a brand-new text today — one owner or whoever’s free?",
      reactionProbe: "If that person’s underwater, what breaks first?",
      silenceCue: "Let the mock animate in their head — don’t narrate every box.",
      privateCoachCue: "Trace the three steps once with your hand — then hands down.",
      transitionTrigger: "They say they could never keep up — that’s your green light.",
      transitionIntent: "hold_silence",
    }),
  };
}

export function buildAppointmentImpact(ctx: MerchantBuildCtx): Imp {
  const raw = ctx.intel?.missedValueEstimate?.trim();
  const stat =
    raw && raw.length > 0 ? (raw.length > 14 ? `${raw.slice(0, 12)}…` : raw) : "18%";
  const venue = appointmentVenuePhrase(ctx.business.type);
  return {
    type: "impact-stat",
    kicker: "Proof",
    title: `A number ${merchantShortName(ctx.business)} already feels`,
    subtitle: ctx.strategy.roiFrame,
    takeaway: "Emotion first — the stat is just permission to care.",
    stat,
    statSub: `What ${venue} owners usually say first`,
    assetKey: "svc-leak-stat",
    merchantVisual: "stat-no-shows",
    conversation: cue({
      beatId: "appt-impact",
      proofPurpose: "They quantify pain without a spreadsheet war.",
      openingQuestion: "Roughly how many slots a month evaporate because life got noisy?",
      reactionProbe: "If you cut that in half, what changes on payroll week?",
      silenceCue: "No correcting their math — round numbers win trust.",
      privateCoachCue: "Eyes on their face when they answer, not the big number.",
      transitionTrigger: "Any number, a sigh, or a head shake — bridge.",
      transitionIntent: "continue_proof",
    }),
  };
}

/** Inquiry / quote / office — forms, email, routing */
export function buildInquiryProofSnapshot(ctx: MerchantBuildCtx): Snap {
  const n = merchantShortName(ctx.business);
  const stream = inquiryVenuePhrase(ctx.business.type);
  const block = merchantPlaceHint(ctx.business);
  const local = block ? `${block} · ` : "";
  return {
    type: "proof-snapshot",
    kicker: "Proof",
    title: `${local}${n} — ${stream} that don’t vanish`,
    subtitle: "What a prospect sees in the first sixty seconds",
    takeaway: "They should feel inbox relief, not software.",
    proofLabel: "Thread starts fast — no ticket graveyard.",
    assetKey: "svc-response-grid",
    merchantVisual: "web-form-lead",
    conversation: cue({
      beatId: "inq-snapshot",
      proofPurpose: "They admit leads cool while waiting on a human.",
      openingQuestion: `When ${stream} land, who sees them first — and how fast?`,
      reactionProbe: "What’s the longest one sat before a real human touched it?",
      silenceCue: "If they wince, you stay quiet — that’s the confession.",
      privateCoachCue: "Index finger on the auto-reply line — not your logo.",
      transitionTrigger: "Delay, shame, or blame a person — move.",
      transitionIntent: "ask_question",
    }),
  };
}

export function buildInquiryComparison(ctx: MerchantBuildCtx): Cmp {
  const stream = inquiryVenuePhrase(ctx.business.type);
  return {
    type: "comparison-proof",
    kicker: "Proof",
    title: `Same ${stream} — different first hour`,
    subtitle: "Personality routing vs one queue the whole team trusts",
    takeaway: "Force a choice: chaos inbox or calm queue.",
    before: {
      headline: "Scattered",
      detail: "Email, text, DMs — whoever grabs it first until they don’t.",
    },
    after: {
      headline: "One lane",
      detail: "Every inquiry gets an ack and an ordered owner ping.",
    },
    assetKey: "svc-before-after",
    merchantVisual: "compare-response-times",
    conversation: cue({
      beatId: "inq-compare",
      proofPurpose: "They feel triage cost, not tool cost.",
      openingQuestion: "Where do good leads usually die — routing or follow-up?",
      reactionProbe: "If you killed one channel tomorrow, which hurts least?",
      silenceCue: "Don’t defend email. Let the seconds speak.",
      privateCoachCue: "Shoulders square — diagnostician, not vendor.",
      transitionTrigger: "Laugh, swear, or get specific — go.",
      transitionIntent: "hold_silence",
    }),
  };
}

export function buildInquiryMockFlow(ctx: MerchantBuildCtx): Flow {
  const n = merchantShortName(ctx.business);
  return {
    type: "mock-flow",
    kicker: "Proof",
    title: `Routing that could run Monday at ${n}`,
    subtitle: `${inquiryVenuePhrase(ctx.business.type)} → ack → owner`,
    takeaway: "They should picture turning it on without a committee.",
    steps: [
      { id: "1", label: "Inquiry lands", hint: "Form / call / DM" },
      { id: "2", label: "Auto-ack", hint: "Sets expectations" },
      { id: "3", label: "Owner alert", hint: "Nothing slips sideways" },
    ],
    assetKey: "svc-automation-3",
    merchantVisual: "routing-automation-flow",
    conversation: cue({
      beatId: "inq-flow",
      proofPurpose: "Accountability without another salary line.",
      openingQuestion: "Who gets blamed when a hot lead goes cold?",
      reactionProbe: "If that person was out sick, what would break?",
      silenceCue: "Let them say the name — that’s the anchor.",
      privateCoachCue: "Slow nod. Zero solution vocabulary.",
      transitionTrigger: "Fear, firefighting, or finger-pointing — advance.",
      transitionIntent: "hold_silence",
    }),
  };
}

export function buildInquiryImpact(ctx: MerchantBuildCtx): Imp {
  const raw = ctx.intel?.missedValueEstimate?.trim();
  const stat =
    raw && raw.length > 0 ? (raw.length > 14 ? `${raw.slice(0, 12)}…` : raw) : "22%";
  return {
    type: "impact-stat",
    kicker: "Proof",
    title: `Leakage ${merchantShortName(ctx.business)} can name`,
    subtitle: ctx.strategy.roiFrame,
    takeaway: "Plain language beats a feature grid every time.",
    stat,
    statSub: `Unanswered ${inquiryVenuePhrase(ctx.business.type)} — how owners describe it`,
    assetKey: "svc-leak-stat",
    merchantVisual: "stat-missed-leads",
    conversation: cue({
      beatId: "inq-impact",
      proofPurpose: "They say the quiet part out loud.",
      openingQuestion: "Ballpark — how many inquiries last quarter never got a real first touch?",
      reactionProbe: "Speed or follow-through — which stings more?",
      silenceCue: "No ROI lecture in the gap.",
      privateCoachCue: "Watch their eyes when they pick a number.",
      transitionTrigger: "Deflate or sharpen — you bridge.",
      transitionIntent: "continue_proof",
    }),
  };
}

export function buildSharedDecisionNext(ctx: MerchantBuildCtx): Dec {
  const n = merchantShortName(ctx.business);
  return {
    type: "decision-next",
    kicker: "Next",
    title: `If that matches how ${n} runs day-to-day`,
    subtitle: "We keep numbers boring on purpose",
    takeaway: "Pilot language — not platform language.",
    bridge: "You’ve seen the loop — next is a small start, not a binder.",
    merchantVisual: "decision-bridge",
    conversation: cue({
      beatId: "shared-decision",
      proofPurpose: "Permission before dollars.",
      openingQuestion: "Fair to look at a lean pilot on your next busy cycle?",
      reactionProbe: "What would ‘easy yes’ look like on your side?",
      silenceCue: "Count to five in your head after you ask.",
      privateCoachCue: "Open palm — invite, don’t close.",
      transitionTrigger: "Yes, maybe, or what’s involved — go to the ask.",
      transitionIntent: "move_to_ask",
    }),
  };
}

export const APPOINTMENT_DEFAULT_MODE: OpeningMode = "proof-snapshot";
export const INQUIRY_DEFAULT_MODE: OpeningMode = "pain-to-proof";

function offerToTier(offer: OfferTemplate): PricingTier {
  const setupLabel =
    offer.setupFee <= 0 ? "No setup fee" : `$${Math.round(offer.setupFee)} setup`;
  return {
    id: offer.id,
    name: offer.label,
    price: `$${offer.monthlyFee}/mo`,
    subtitle: setupLabel,
    highlights: offer.includedBullets.slice(0, 6),
    recommended: true,
  };
}

export function buildSharedPricing(ctx: MerchantBuildCtx, offer: OfferTemplate): Pri {
  const n = merchantShortName(ctx.business);
  return {
    type: "pricing",
    kicker: "Offer",
    title: `One lean start for ${n}`,
    subtitle: offer.pilotSubtitle ?? "Prove it on your floor — pause or adjust after the window.",
    tiers: [offerToTier(offer)],
    disclaimer:
      ctx.strategy.pricingNotes ??
      offer.disclaimer ??
      "Figures are indicative — final terms in a short written pilot.",
    merchantVisual: "simple-ask",
    conversation: cue({
      beatId: "shared-pricing",
      proofPurpose: "They choose try, not buy-the-stack.",
      openingQuestion:
        "If we keep it to a short pilot aimed at the leak you just saw, is that fair to try?",
      reactionProbe: "What would make yes feel safe — terms, timing, or exit?",
      silenceCue: "After you state the number — mouth closed until they move.",
      privateCoachCue: "One card on screen — no tier tour.",
      objectionCue: "Price pushback — anchor the pilot window and pause, not the feature grid.",
      transitionTrigger: "Terms, risk, or timing questions — answer short, then advance.",
      transitionIntent: "answer_concern",
    }),
  };
}

export function buildSharedActions(): Act {
  return {
    type: "presentation-actions",
    kicker: "Next step",
    title: "What should we do next?",
    subtitle: "They choose — you don’t narrate the menu.",
    merchantVisual: "next-step",
    conversation: cue({
      beatId: "shared-actions",
      proofPurpose: "Concrete motion — nothing clever.",
      openingQuestion: "Which button matches what you want this week?",
      reactionProbe: "If stuck, what one thing would make it obvious?",
      silenceCue: "Let them read — no voice-over.",
      privateCoachCue: "Repeat their words back once if needed — then hush.",
      transitionTrigger: "They tap or say it — you’re done proving.",
      transitionIntent: "continue_proof",
    }),
  };
}
