import type { CloseOutcomeType } from "@/types/session";

export type CloseOutcomeOption = {
  type: CloseOutcomeType;
  label: string;
  sub: string;
  color: string;
  activeColor: string;
};

export const CLOSE_OUTCOMES: CloseOutcomeOption[] = [
  {
    type: "start-now",
    label: "Start Now",
    sub: "They're in — confirm package and contact",
    color: "border-border bg-card hover:border-signal-green/40",
    activeColor: "border-signal-green/50 bg-signal-green/8 shadow-sm",
  },
  {
    type: "send-proposal",
    label: "Send Proposal",
    sub: "They want it in writing first",
    color: "border-border bg-card hover:border-accent/40",
    activeColor: "border-accent/50 bg-accent/8 shadow-sm",
  },
  {
    type: "book-setup-call",
    label: "Book Setup Call",
    sub: "Committed — schedule the onboarding call",
    color: "border-border bg-card hover:border-accent/40",
    activeColor: "border-accent/50 bg-accent/8 shadow-sm",
  },
  {
    type: "need-decision-maker",
    label: "Need Decision-Maker",
    sub: "Not the right person — need to get the owner",
    color: "border-border bg-card hover:border-signal-yellow/40",
    activeColor: "border-signal-yellow/50 bg-signal-yellow/8 shadow-sm",
  },
  {
    type: "follow-up-later",
    label: "Follow Up Later",
    sub: "Interested but not ready today",
    color: "border-border bg-card hover:border-signal-yellow/40",
    activeColor: "border-signal-yellow/50 bg-signal-yellow/8 shadow-sm",
  },
  {
    type: "not-interested",
    label: "Not Interested",
    sub: "Passed — choose a loss reason",
    color: "border-border bg-card hover:border-signal-red/40",
    activeColor: "border-signal-red/50 bg-signal-red/8 shadow-sm",
  },
  {
    type: "not-a-fit",
    label: "Not a Fit",
    sub: "Business doesn't qualify for this solution",
    color: "border-border bg-card hover:border-signal-red/40",
    activeColor: "border-signal-red/50 bg-signal-red/8 shadow-sm",
  },
];

export const CLOSE_PACKAGES = ["Core Starter", "Growth System", "Scale Package"] as const;

export const CLOSE_FOLLOW_UP_TIMINGS = [
  "Tomorrow",
  "This week",
  "Next week",
  "2 weeks",
  "1 month",
] as const;

export const CLOSE_LOSS_REASONS = [
  "Price too high",
  "Already has a solution",
  "No budget right now",
  "Not the right time",
  "Couldn't see the value",
  "Wrong contact / gatekeeper",
  "Other",
] as const;

export const CLOSE_FOLLOW_UP_REASONS = [
  "Wants to think it over",
  "Needs to review with partner",
  "Waiting on cash flow",
  "Currently under contract",
  "Wants to see results first",
  "Other",
] as const;
