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
  | "close-open-account";

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
      type: Exclude<SlideType, "pricing" | "interactive-proof" | "close-open-account">;
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
  | (BaseSlide & {
      type: "close-open-account";
      ctaLabel: string;
      bullets?: string[];
      disclaimer?: string;
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

  const combined = [...fromNotes, ...fromIntel];
  return Array.from(new Set(combined)).slice(0, 6);
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
          "Rep guidance when objections appear",
        ];

  const proofPoints =
    material?.proofPoints?.length
      ? material.proofPoints
      : [
          "Respond in minutes, not hours",
          "Catch after-hours inquiries automatically",
          "Track signals and objections so the rep stays in control",
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
      highlights: ["Everything in Starter", "Live coaching overlays", "Performance scoring + recap"],
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

  return [
    {
      id: `${idPrefix}-snapshot`,
      type: "business-snapshot",
      kicker: "Buyer Presentation",
      title: strategy.productName
        ? `${strategy.productName} for ${strategy.targetCustomer ?? strategy.businessType}`
        : `Business snapshot: ${strategy.businessType}`,
      subtitle: `Lead source: ${strategy.leadSource} · ${business.name}`,
      callout: constraintsLine ? { label: "Context", value: constraintsLine } : undefined,
    },
    {
      id: `${idPrefix}-pain`,
      type: "pain",
      kicker: "The problem",
      title: "The window you lose is invisible",
      subtitle: strategy.painFrame,
      bullets: intel?.keyOpportunities?.length
        ? intel.keyOpportunities.slice(0, 4)
        : ["Leads age out before the first response", "Follow-up drops when the team is busy"],
      callout: intel?.missedValueEstimate
        ? { label: "Estimated missed value", value: `${intel.missedValueEstimate} / mo` }
        : undefined,
    },
    {
      id: `${idPrefix}-roi`,
      type: "cost-roi",
      kicker: "Cost / ROI",
      title: "Small response-time gains compound fast",
      subtitle: strategy.roiFrame,
      bullets: ["Fewer uncontacted leads", "Higher show rates from faster follow-up", "Cleaner closes under pressure"],
    },
    {
      id: `${idPrefix}-proof`,
      type: "solution",
      kicker: "The solution",
      title: "A sales execution layer that runs the moment a lead arrives",
      subtitle: "Front stage: premium presentation. Back stage: tactical coaching—quietly.",
      bullets: strategy.coreBenefits.slice(0, 4),
    },
    {
      id: `${idPrefix}-proof-points`,
      type: "proof",
      kicker: "Proof",
      title: "Built around conversion moments",
      subtitle: "Not a dashboard. A selling surface that stays on-rails.",
      bullets: strategy.proofPoints.slice(0, 5),
    },
    {
      id: `${idPrefix}-interactive`,
      type: "interactive-proof",
      kicker: "Interactive proof",
      title: "Show it working in 60 seconds",
      subtitle: "A believable front-end simulation (no real SMS yet).",
      prompt: "Enter a phone number to simulate outreach → scheduling → booking confirmation.",
    },
    {
      id: `${idPrefix}-pricing`,
      type: "pricing",
      kicker: "Pricing",
      title: "Pick a tier to start lean",
      subtitle: "Start small, prove it works, then scale coverage.",
      tiers,
      disclaimer: strategy.pricingNotes ?? "Tier names and pricing are demo defaults and can be tailored.",
    },
    {
      id: `${idPrefix}-close`,
      type: "close-open-account",
      kicker: "Open account",
      title: "Open the account and hand off onboarding",
      subtitle: "Lock the next step while momentum is present.",
      ctaLabel: strategy.onboardingCta ?? "Open Account →",
      bullets: [
        "Pick a start date",
        "Add your team",
        "Connect your lead sources (later: GHL/Twilio)",
      ],
      disclaimer: "This is a front-end simulation today—no integrations required.",
    },
  ];
}

