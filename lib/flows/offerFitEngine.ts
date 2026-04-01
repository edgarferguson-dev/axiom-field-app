import type { BusinessConstraint, ConstraintKey } from "@/types/session";

// ── Solution component definitions ────────────────────────────────────────

export type SolutionComponent = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  impact: "high" | "medium";
};

export type PackageTier = "core" | "growth" | "scale";

export type OfferFitResult = {
  components: SolutionComponent[];
  tier: PackageTier;
  tierLabel: string;
  rationale: string;
  businessEffect: string;
  primaryConstraint: ConstraintKey | null;
};

// ── Constraint → solution mapping ─────────────────────────────────────────

const CONSTRAINT_SOLUTIONS: Record<ConstraintKey, SolutionComponent> = {
  "missed-calls": {
    id: "missed-call-textback",
    name: "Missed Call Text Back",
    shortName: "Missed Call Recovery",
    description: "Instantly texts anyone who calls and gets no answer — keeping leads warm automatically.",
    impact: "high",
  },
  "no-booking": {
    id: "booking-automation",
    name: "Automated Booking System",
    shortName: "Smart Booking",
    description: "24/7 booking link with confirmations, reminders, and no-show reduction.",
    impact: "high",
  },
  "weak-reviews": {
    id: "review-system",
    name: "Review Request System",
    shortName: "Review Builder",
    description: "Automated post-visit review requests via text — builds Google ratings on autopilot.",
    impact: "high",
  },
  "slow-follow-up": {
    id: "lead-response",
    name: "Speed-to-Lead Automation",
    shortName: "Instant Follow-Up",
    description: "Responds to new leads within 60 seconds — before any competitor can call back.",
    impact: "high",
  },
  "weak-online-presence": {
    id: "online-presence",
    name: "Online Presence Boost",
    shortName: "Online Presence",
    description: "GMB optimization, consistent listings, and automated review flow working together.",
    impact: "medium",
  },
  "no-automation": {
    id: "automation-suite",
    name: "Marketing Automation Suite",
    shortName: "Core Automation",
    description: "Full follow-up, nurture, and reactivation workflows — running 24/7 without manual effort.",
    impact: "high",
  },
  "poor-retention": {
    id: "retention-sequence",
    name: "Retention Sequences",
    shortName: "Retention Flow",
    description: "Automated check-ins and targeted offers to keep existing customers active and loyal.",
    impact: "medium",
  },
  "no-reactivation": {
    id: "reactivation-campaign",
    name: "Reactivation Campaign",
    shortName: "Win-Back Campaign",
    description: "Re-engages cold or lapsed customers with targeted text and email sequences.",
    impact: "high",
  },
  "inconsistent-pipeline": {
    id: "crm-pipeline",
    name: "CRM + Pipeline Management",
    shortName: "CRM Pipeline",
    description: "Structured lead pipeline so no deal is forgotten, dropped, or lost to a slow follow-up.",
    impact: "high",
  },
  "no-nurture": {
    id: "nurture-automation",
    name: "Nurture Automation",
    shortName: "Lead Nurture",
    description: "Long-game sequences that warm leads consistently until they are ready to commit.",
    impact: "medium",
  },
  "owner-too-busy": {
    id: "full-automation",
    name: "Full Automation Stack",
    shortName: "Full Automation",
    description: "Removes manual follow-up entirely — the system works while the owner runs the business.",
    impact: "high",
  },
  "no-clear-offer": {
    id: "offer-clarity",
    name: "Offer Clarity System",
    shortName: "Offer Build-Out",
    description: "Clear, compelling service packaging that converts better across every channel and conversation.",
    impact: "medium",
  },
  "low-trust": {
    id: "social-proof",
    name: "Social Proof System",
    shortName: "Trust Builder",
    description: "Reviews, testimonials, and case study capture that build instant credibility with new prospects.",
    impact: "medium",
  },
  "poor-lead-handling": {
    id: "lead-response-crm",
    name: "Lead Response + CRM",
    shortName: "Lead Management",
    description: "Structured intake, instant response, and tracked follow-through on every inbound lead.",
    impact: "high",
  },
};

// ── Package tier definitions ───────────────────────────────────────────────

const TIER_LABELS: Record<PackageTier, string> = {
  core: "Core Starter",
  growth: "Growth System",
  scale: "Scale Package",
};

function resolveTier(constraints: BusinessConstraint[]): PackageTier {
  const highCount = constraints.filter((c) => c.severity === "high").length;
  const total = constraints.length;
  if (highCount >= 3 || total >= 5) return "scale";
  if (highCount >= 2 || total >= 3) return "growth";
  return "core";
}

function buildRationale(
  constraints: BusinessConstraint[],
  components: SolutionComponent[],
  tier: PackageTier
): string {
  if (tier === "scale") {
    return `With ${constraints.length} active constraints — several at high severity — this business needs a full-platform approach. Piecemeal tools won't hold. A unified system handles follow-up, booking, reviews, and reactivation in one workflow without adding headcount.`;
  }
  if (tier === "growth") {
    const highImpact = components
      .filter((c) => c.impact === "high")
      .slice(0, 2)
      .map((c) => c.shortName);
    return `The core gaps here point to ${highImpact.join(" and ")} as the highest-leverage starting points. Building these out creates compounding momentum across lead capture, follow-up, and retention without overwhelming the team.`;
  }
  return `One or two targeted automations solve the immediate pain. Start with the highest-impact fix — prove ROI fast — then expand the platform as the business gains confidence.`;
}

function buildEffect(components: SolutionComponent[], tier: PackageTier): string {
  if (tier === "scale") {
    return "Stops revenue leakage from missed calls, slow follow-up, and weak reviews simultaneously. Frees the owner from manual outreach entirely.";
  }
  if (tier === "growth") {
    const hasMissedCall = components.some((c) => c.id === "missed-call-textback");
    const hasBooking = components.some((c) => c.id === "booking-automation");
    if (hasMissedCall && hasBooking) {
      return "Every missed call becomes a booked appointment automatically — no manual follow-up required.";
    }
    if (hasMissedCall) {
      return "Captures more leads without adding headcount. Every missed call becomes a live conversation within seconds.";
    }
    return "More consistent follow-through with less manual work — leads don't slip and customers stay engaged longer.";
  }
  return "Solves the most urgent gap so the owner sees tangible ROI before expanding to the full system.";
}

// ── Public API ─────────────────────────────────────────────────────────────

export function buildOfferFit(
  constraints: BusinessConstraint[],
  businessType?: string
): OfferFitResult {
  if (constraints.length === 0) {
    return {
      components: [],
      tier: "core",
      tierLabel: TIER_LABELS.core,
      rationale:
        "No constraints were identified. Use this screen to manually position the right starting package for this business.",
      businessEffect:
        "Review and select the most relevant package based on what you observed in the conversation.",
      primaryConstraint: null,
    };
  }

  // Sort by severity — high first, then map to components
  const sorted = [...constraints].sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  const seen = new Set<string>();
  const components: SolutionComponent[] = [];
  for (const constraint of sorted) {
    const comp = CONSTRAINT_SOLUTIONS[constraint.key];
    if (comp && !seen.has(comp.id)) {
      seen.add(comp.id);
      components.push(comp);
    }
  }

  const tier = resolveTier(constraints);
  const rationale = buildRationale(constraints, components, tier);
  const businessEffect = buildEffect(components, tier);
  const primaryConstraint = sorted[0]?.key ?? null;

  return { components, tier, tierLabel: TIER_LABELS[tier], rationale, businessEffect, primaryConstraint };
}
