import type { DispositionOutcome } from "@/types/disposition";

export type FollowUpTemplates = {
  text: string;
  emailSubject: string;
  emailBody: string;
  /** One-line next physical / CRM step for the rep. */
  nextStep: string;
};

const DEFAULT: FollowUpTemplates = {
  text: "Thanks for today — one-line recap coming. Reply when you want to continue.",
  emailSubject: "Following up from our visit",
  emailBody:
    "Hi — thanks for sitting down.\n\nRecap:\n- What we heard\n- Next step\n\nReply with a time or questions.\n",
  nextStep: "Send recap within 24h; book follow-up if they asked.",
};

const BY_OUTCOME: Partial<Record<DispositionOutcome, FollowUpTemplates>> = {
  interestedNotReady: {
    text: "Great meeting you — recap when you're ready. No pressure.",
    emailSubject: "Recap from today",
    emailBody: "Hi — thanks for today.\nShort summary + link as discussed.\nPing when you want to continue.\n",
    nextStep: "Schedule send for agreed day; one check-in text only.",
  },
  followUpBooked: {
    text: "Confirming follow-up — text me if timing shifts.",
    emailSubject: "Confirmed — follow-up",
    emailBody: "Hi — confirming our next touch as discussed.\nI'll follow the plan; reply if anything changes.\n",
    nextStep: "Calendar block + reminder 1h before.",
  },
  noDecisionMaker: {
    text: "Thanks — happy to do a 10-min recap with the decision-maker.",
    emailSubject: "Next step — decision-maker",
    emailBody: "Hi — when the owner can join briefly, I'll keep it tight.\n",
    nextStep: "Get DM name + best window; book before you leave lot.",
  },
  notQualified: {
    text: "Thanks for the honesty — I'm one text away if things change.",
    emailSubject: "Thanks for today",
    emailBody: "Hi — thanks for the clear conversation.\nReach out if priorities shift.\n",
    nextStep: "Mark lost in directory; no chase for 30 days.",
  },
  noFit: {
    text: "Appreciate the straight answer — good season to you.",
    emailSubject: "Thanks for your time",
    emailBody: "Hi — thanks for the direct feedback.\nIf needs change, I'm here.\n",
    nextStep: "Close file; optional nurture in 90 days.",
  },
  closed: {
    text: "Excited to start — next message has setup + day-one expectations.",
    emailSubject: "Next steps — getting started",
    emailBody: "Hi — great to lock this in.\nHere's what happens next.\n",
    nextStep: "Trigger onboarding workflow; confirm start date in CRM.",
  },
  "follow-up": {
    text: "Thanks today — I'll follow up with what we aligned on.",
    emailSubject: "Following up from our visit",
    emailBody: "Hi — recap and next step below.\nPing me to continue.\n",
    nextStep: "Send recap same day; propose two time options.",
  },
  priceObjection: {
    text: "Thanks for candor on budget — sending lighter option + ROI one-pager.",
    emailSubject: "Options after pricing",
    emailBody: "Hi — lighter path + numbers we walked through.\n",
    nextStep: "Email tier comparison; book 15m to confirm tier.",
  },
};

export function getFollowUpTemplates(outcome: DispositionOutcome): FollowUpTemplates {
  return BY_OUTCOME[outcome] ?? DEFAULT;
}
