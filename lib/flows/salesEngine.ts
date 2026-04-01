import { ObjectionType, SalesStep, Signal } from "@/types/session";

const PLAYBOOK: Record<ObjectionType, SalesStep> = {
  price: {
    objection: "price",
    rebuttal: "I hear that — and most owners say the same thing right here.",
    benefit:
      "What this does is recover the jobs that quietly go dark between first contact and follow-up. That's usually where the margin is.",
    question:
      "If it helped you recover even one extra job a week, would the cost become a non-issue?",
    close:
      "Let's run it lean at first so you can watch the numbers before committing to anything bigger.",
  },
  busy: {
    objection: "busy",
    rebuttal: "That tells me everything — being too busy is exactly when this earns its place.",
    benefit:
      "It's built for the gap between when a lead comes in and when your team can actually respond. That window is where most opportunities disappear.",
    question:
      "On your busiest days, how many messages do you think go unanswered for more than a few hours?",
    close:
      "This handles that window automatically — no extra work, no extra headcount.",
  },
  "already-have": {
    objection: "already-have",
    rebuttal: "That's good — it means speed of response is already on your radar.",
    benefit:
      "What most systems still miss is the follow-through: catching leads that came in off-hours, or those who didn't leave a voicemail.",
    question:
      "Does your current setup catch every inquiry within the first few minutes, even at 10pm on a Friday?",
    close:
      "This fills the gaps your current setup leaves — no replacement required.",
  },
  "not-interested": {
    objection: "not-interested",
    rebuttal: "Completely fair. If things feel handled right now, that makes sense.",
    benefit:
      "The owners who say that are usually still losing a handful of jobs quietly — it just doesn't show up anywhere visible.",
    question:
      "If that was happening here and you had a way to see it, would you want to know?",
    close:
      "We keep the first step simple and low-stakes — prove it works before you decide anything.",
  },
  timing: {
    objection: "timing",
    rebuttal: "Timing is always the honest answer — I respect that.",
    benefit:
      "The reason most people start now is that the problem doesn't pause for a better quarter. Every week that passes is leads that went somewhere else.",
    question:
      "If we could make the first step take less than fifteen minutes, would timing still be the main thing stopping you?",
    close:
      "We start small, you see it work, and then you decide what to do with it from there.",
  },
};

export function resolveObjection(type: ObjectionType): SalesStep {
  return PLAYBOOK[type];
}

export function getSignalForObjection(type: ObjectionType): Signal {
  if (type === "not-interested") return "red";
  return "yellow";
}

export function getAllPlaybookSteps(): SalesStep[] {
  return Object.values(PLAYBOOK);
}
