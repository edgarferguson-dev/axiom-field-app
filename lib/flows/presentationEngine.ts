import type { BusinessProfile, PreCallIntel } from "@/types/session";
import type { MaterialSummary } from "@/lib/flows/materialEngine";

export type SlideType =
  | "business-snapshot"
  | "pain"
  | "cost-roi"
  | "solution"
  | "proof"
  | "interactive-proof"
  | "pricing"
  | "presentation-actions";

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

export type PresentationSlide =
  | (BaseSlide & {
      type: Exclude<SlideType, "pricing" | "interactive-proof" | "presentation-actions">;
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
    })
  | (BaseSlide & { type: "presentation-actions" });

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

export function generatePresentationSlides(
  business: BusinessProfile,
  strategy: StrategyPackage,
  intel?: PreCallIntel | null
): PresentationSlide[] {
  const idPrefix = `slide-${business.type || "biz"}`.toLowerCase().replace(/\s+/g, "-");

  const constraintsLine =
    strategy.constraints.length > 0 ? `Constraints: ${strategy.constraints.join(" · ")}` : undefined;

  const tiers: PricingTier[] = [
    {
      id: "starter",
      name: "Starter",
      price: "$299/mo",
      subtitle: "Proof of value",
      highlights: ["Lead capture + instant response", "After-hours coverage", "Basic reporting"],
    },
    {
      id: "growth",
      name: "Growth",
      price: "$599/mo",
      subtitle: "Most teams land here",
      highlights: ["Everything in Starter", "Guided selling overlays", "Performance scoring + recap"],
      recommended: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$999/mo",
      subtitle: "Highest leverage",
      highlights: ["Everything in Growth", "Advanced routing + playbooks", "Priority support"],
    },
  ];

  // Intentional sequence: context → problem → mechanism → proof → outcome → live demo → offer → commit
  return [
    {
      id: `${idPrefix}-snapshot`,
      type: "business-snapshot",
      kicker: "Opening",
      title: strategy.productName
        ? `${strategy.productName} for ${strategy.targetCustomer ?? strategy.businessType}`
        : `How we’ll present ${strategy.businessType}`,
      subtitle: `${business.name} · Lead source: ${strategy.leadSource}`,
      callout: constraintsLine ? { label: "Scout context", value: constraintsLine } : undefined,
    },
    {
      id: `${idPrefix}-pain`,
      type: "pain",
      kicker: "Problem",
      title: "The cost isn’t a bad month — it’s the leads that never get a real first response",
      subtitle: strategy.painFrame,
      bullets: intel?.keyOpportunities?.length
        ? intel.keyOpportunities.slice(0, 4)
        : ["Leads age out before the first response", "Follow-up drops when the team is busy"],
      callout: intel?.missedValueEstimate
        ? { label: "Estimated missed value", value: `${intel.missedValueEstimate} / mo` }
        : undefined,
    },
    {
      id: `${idPrefix}-proof`,
      type: "solution",
      kicker: "Mechanism",
      title: "A structured execution layer the moment a lead arrives",
      subtitle: "One buyer-facing story, consistent pacing, and clear next steps — without turning the call into a generic app tour.",
      bullets: strategy.coreBenefits.slice(0, 4),
    },
    {
      id: `${idPrefix}-proof-points`,
      type: "proof",
      kicker: "Proof",
      title: "Designed around conversion moments — not vanity metrics",
      subtitle: "What you’re seeing is a selling surface that stays on-rails when it matters.",
      bullets: strategy.proofPoints.slice(0, 5),
    },
    {
      id: `${idPrefix}-roi`,
      type: "cost-roi",
      kicker: "Outcome",
      title: "Small response-time gains compound fast",
      subtitle: strategy.roiFrame,
      bullets: ["Fewer uncontacted leads", "Higher show rates from faster follow-up", "Cleaner momentum into the decision"],
    },
    {
      id: `${idPrefix}-interactive`,
      type: "interactive-proof",
      kicker: "See it live",
      title: "Show the workflow in under a minute",
      subtitle: "A believable front-end simulation (no real SMS in this demo).",
      prompt: "Enter a phone number to simulate outreach → scheduling → booking confirmation.",
    },
    {
      id: `${idPrefix}-pricing`,
      type: "pricing",
      kicker: "Offer",
      title: "Pick a tier to start lean",
      subtitle: "Start small, prove it works, then scale coverage.",
      tiers,
      disclaimer: strategy.pricingNotes ?? "Tier names and pricing are demo defaults and can be tailored.",
    },
    {
      id: `${idPrefix}-actions`,
      type: "presentation-actions",
      kicker: "Next step",
      title: "What should we do next?",
      subtitle: "Pick one action below — rep talk track stays private.",
    },
  ];
}

