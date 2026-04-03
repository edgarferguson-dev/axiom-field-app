import type { BusinessProfile, PreCallIntel } from "@/types/session";
import type { MaterialSummary } from "@/lib/flows/materialEngine";
import type { MerchantProofBeatCue, MerchantVisualSurface } from "@/types/merchantProof";

export type SlideType =
  | "business-snapshot"
  | "pain"
  | "cost-roi"
  | "solution"
  | "proof"
  | "interactive-proof"
  | "pricing"
  | "presentation-actions"
  /** RFC 7 — proof-led beats (visual + one-line takeaway) */
  | "proof-snapshot"
  | "mock-flow"
  | "comparison-proof"
  | "impact-stat"
  | "decision-next";

export type PricingTier = {
  id: string;
  name: string;
  price: string;
  subtitle?: string;
  highlights: string[];
  recommended?: boolean;
};

type BaseSlide = {
  id: string;
  type: SlideType;
  kicker?: string;
  title: string;
  subtitle?: string;
};

type ClassicTextSlideType = Exclude<
  SlideType,
  | "pricing"
  | "interactive-proof"
  | "presentation-actions"
  | "proof-snapshot"
  | "mock-flow"
  | "comparison-proof"
  | "impact-stat"
  | "decision-next"
>;

export type PresentationSlide =
  | (BaseSlide & {
      type: ClassicTextSlideType;
      bullets?: string[];
      callout?: { label: string; value: string };
    })
  | (BaseSlide & {
      type: "interactive-proof";
      prompt: string;
    })
  | (BaseSlide & {
      type: "pricing";
      tiers: PricingTier[];
      disclaimer?: string;
      conversation?: MerchantProofBeatCue;
      merchantVisual?: MerchantVisualSurface;
    })
  | (BaseSlide & {
      type: "presentation-actions";
      conversation?: MerchantProofBeatCue;
      merchantVisual?: MerchantVisualSurface;
    })
  | (BaseSlide & {
      type: "proof-snapshot";
      takeaway: string;
      /** Buyer-safe: what claim this slide establishes */
      proofLabel: string;
      /** Key into presentation asset registry (no URLs in store). */
      assetKey: string;
      conversation?: MerchantProofBeatCue;
      merchantVisual?: MerchantVisualSurface;
    })
  | (BaseSlide & {
      type: "mock-flow";
      takeaway: string;
      steps: { id: string; label: string; hint?: string }[];
      assetKey?: string;
      conversation?: MerchantProofBeatCue;
      merchantVisual?: MerchantVisualSurface;
    })
  | (BaseSlide & {
      type: "comparison-proof";
      takeaway: string;
      before: { headline: string; detail: string };
      after: { headline: string; detail: string };
      assetKey?: string;
      conversation?: MerchantProofBeatCue;
      merchantVisual?: MerchantVisualSurface;
    })
  | (BaseSlide & {
      type: "impact-stat";
      takeaway: string;
      stat: string;
      statSub: string;
      assetKey?: string;
      conversation?: MerchantProofBeatCue;
      merchantVisual?: MerchantVisualSurface;
    })
  | (BaseSlide & {
      type: "decision-next";
      takeaway: string;
      bridge: string;
      conversation?: MerchantProofBeatCue;
      merchantVisual?: MerchantVisualSurface;
    });

// StrategyPackage is used to shape the pitch, without touching store logic.
export type StrategyPackage = {
  businessType: string;
  leadSource: string;
  constraints: string[];
  productName?: string;
  targetCustomer?: string;
  painFrame?: string;
  coreBenefits: string[];
  proofPoints: string[];
  pricingNotes?: string;
  onboardingCta?: string;
  roiFrame?: string;
};

function normalizeConstraints(business: BusinessProfile, intel?: PreCallIntel | null): string[] {
  const fromCaptured =
    business.capturedConstraintLabels?.filter(Boolean).slice(0, 12) ?? [];

  const fromNotes = business.notes
    ? business.notes
        .split(/[,;\n]/g)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const fromIntel = intel?.riskBand
    ? [
        intel.riskBand === "high"
          ? "High urgency / risk profile"
          : intel.riskBand === "medium"
          ? "Moderate urgency / mixed risk signals"
          : "Low urgency / conservative buyer"
      ]
    : [];

  const combined = [...fromCaptured, ...fromNotes, ...fromIntel];
  return Array.from(new Set(combined)).slice(0, 8);
}

export function buildStrategyPackage(
  business: BusinessProfile,
  intel?: PreCallIntel | null,
  material?: MaterialSummary | null
): StrategyPackage {
  const businessType = business.type || "Service business";
  const leadSource = business.leadSource || "Inbound";
  const constraints = normalizeConstraints(business, intel);

  const productName = material?.productName;
  const targetCustomer = material?.targetCustomer;

  const painFrame =
    material?.painSolved ??
    intel?.painPattern ??
    `When leads come in from ${leadSource.toLowerCase()}, the real loss is the ones that go cold before anyone responds.`;

  const coreBenefits =
    material?.coreBenefits?.length
      ? material.coreBenefits
      : [
          "Instant response so you win the first window",
          "After-hours coverage without extra headcount",
          "Structured prompts when objections surface",
        ];

  const proofPoints =
    material?.proofPoints?.length
      ? material.proofPoints
      : [
          "Respond in minutes, not hours",
          "Catch after-hours inquiries automatically",
          "Keep the conversation on-rails when the room gets noisy",
        ];

  const roiFrame =
    intel?.missedValueEstimate
      ? `Recover even a portion of ${intel.missedValueEstimate}/mo by tightening the first-response window.`
      : "Recover lost jobs by tightening the first-response window and follow-through.";

  return {
    businessType,
    leadSource,
    constraints,
    painFrame,
    productName,
    targetCustomer,
    coreBenefits,
    proofPoints,
    pricingNotes: material?.pricingNotes,
    onboardingCta: material?.onboardingCta,
    roiFrame,
  };
}

/** Deck generation lives in `@/lib/presentation/generateProofLedSlides` (RFC 7 — proof-led packs). */

