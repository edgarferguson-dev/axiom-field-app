import type { SlideType } from "@/lib/flows/presentationEngine";

export type PresentationBeat = {
  id: string;
  slideTypes: SlideType[];
  goal: string;
  /** 1–3 short lines the rep can say; each ≤12 words */
  oneLiners: [string, string?, string?];
};

export const PRESENTATION_BEATS: PresentationBeat[] = [
  {
    id: "context",
    slideTypes: ["business-snapshot"],
    goal: "They agree you understand their world.",
    oneLiners: [
      "This is built for how local shops actually run.",
      "If this feels off, tell me — we adjust fast.",
    ],
  },
  {
    id: "pain",
    slideTypes: ["pain"],
    goal: "They agree the problem is real and costly.",
    oneLiners: [
      "Most owners feel this before they fix it.",
      "Does this match your busy weeks?",
      "So the leak is consistency, not effort?",
    ],
  },
  {
    id: "cost",
    slideTypes: ["cost-roi"],
    goal: "They agree inaction has a price.",
    oneLiners: [
      "Rough math beats perfect silence.",
      "Even one missed job a month adds up.",
      "Fair to weigh cost against doing nothing?",
    ],
  },
  {
    id: "solution",
    slideTypes: ["solution"],
    goal: "They see the fix as simple and relevant.",
    oneLiners: [
      "The goal is fewer dropped leads, not more software.",
      "You keep your workflow — we tighten the handoffs.",
      "Does this direction feel realistic for your team?",
    ],
  },
  {
    id: "proof",
    slideTypes: [
      "proof",
      "interactive-proof",
      "proof-snapshot",
      "mock-flow",
      "comparison-proof",
      "impact-stat",
      "decision-next",
    ],
    goal: "They believe the outcome is plausible.",
    oneLiners: [
      "Point at the proof — let them narrate what they see.",
      "Does this match a busy week for you?",
      "If this is true, what would you change first?",
    ],
  },
  {
    id: "offer",
    slideTypes: ["pricing", "health-report-share", "presentation-actions"],
    goal: "They accept a clear next step.",
    oneLiners: [
      "Which option fits how you want to start?",
      "Ready to pick a start date, or need a day to decide?",
      "Want a short recap text after this?",
    ],
  },
];

export function getBeatForSlideType(slideType: SlideType | null | undefined): PresentationBeat | null {
  if (!slideType) return null;
  return PRESENTATION_BEATS.find((b) => b.slideTypes.includes(slideType)) ?? null;
}
