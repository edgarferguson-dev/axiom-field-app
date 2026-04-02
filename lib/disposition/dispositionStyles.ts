import type { DispositionStatus } from "@/types/disposition";

export const DISPOSITION_STATUS_STYLES: Record<DispositionStatus, { badge: string; label: string }> = {
  won: { badge: "border-signal-green/30 bg-signal-green/10 text-signal-green", label: "Won" },
  "proposal-sent": { badge: "border-accent/30 bg-accent/10 text-accent", label: "Proposal Sent" },
  "follow-up-scheduled": {
    badge: "border-signal-yellow/30 bg-signal-yellow/10 text-signal-yellow",
    label: "Follow-Up Scheduled",
  },
  "needs-decision-maker": {
    badge: "border-signal-yellow/30 bg-signal-yellow/10 text-signal-yellow",
    label: "Needs Decision-Maker",
  },
  "objection-unresolved": {
    badge: "border-signal-red/20 bg-signal-red/10 text-signal-red",
    label: "Objection Unresolved",
  },
  "no-fit": { badge: "border-signal-red/20 bg-signal-red/10 text-signal-red", label: "Not a Fit" },
  lost: { badge: "border-border bg-surface text-muted", label: "Lost" },
};

export const DISPOSITION_TREND_COLOR: Record<string, string> = {
  improving: "text-signal-green",
  declining: "text-signal-red",
  mixed: "text-signal-yellow",
  neutral: "text-muted",
};
