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
    slideTypes: ["proof", "interactive-proof"],
    goal: "They believe the outcome is plausible.",
    oneLiners: [
      "Walk me through what you would want to see.",
      "Does this line up with what you have seen?",
      "If true, would that change how you operate?",
    ],
  },
  {
    id: "offer",
    slideTypes: ["pricing", "presentation-actions"],
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
