import type { BusinessProfile } from "@/types/session";
import type { PostRunCapture, PostRunResult } from "@/types/postRunCapture";
import {
  captureMatchesBusinessProfile,
  computeLocalBusinessIdentityKey,
  normalizeVisitBusinessKey,
} from "@/lib/field/businessIdentity";

export { normalizeVisitBusinessKey } from "@/lib/field/businessIdentity";

export const POST_RUN_RESULT_LABEL: Record<PostRunResult, string> = {
  no_interest: "No interest",
  interested_not_now: "Interested · not now",
  follow_up_needed: "Follow-up needed",
  wants_info_sent: "Wants info sent",
  book_follow_up: "Book follow-up",
  soft_commit: "Soft commit",
  hard_commit: "Hard commit",
};

export function formatVisitDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function hasMinVisitMemoryHint(profile: Partial<BusinessProfile>): boolean {
  return (
    normalizeVisitBusinessKey(profile.name ?? "").length >= 2 ||
    Boolean(computeLocalBusinessIdentityKey(profile))
  );
}

/** Newest matching capture for this business (identity-aware, local only). */
export function lastVisitForBusinessProfile(
  captures: PostRunCapture[],
  profile: Partial<BusinessProfile>
): PostRunCapture | null {
  const key = computeLocalBusinessIdentityKey(profile);
  const nameOk = normalizeVisitBusinessKey(profile.name ?? "").length >= 2;
  if (!key && !nameOk) return null;
  for (const c of captures) {
    if (captureMatchesBusinessProfile(c, profile)) return c;
  }
  return null;
}

/** Deterministic next-visit cues from one capture — no scoring engine. */
export function nextVisitGuidanceLines(c: PostRunCapture): string[] {
  const lines: string[] = [];

  switch (c.result) {
    case "no_interest":
      lines.push("Last outcome: no interest — only re-engage if something clearly changed.");
      break;
    case "interested_not_now":
      lines.push("They were interested but not ready — keep proof tight; confirm timing.");
      break;
    case "follow_up_needed":
      lines.push("Follow-up was needed — open with the thread you left, not a fresh pitch.");
      break;
    case "wants_info_sent":
      lines.push("They wanted materials — lead with what you sent and one proof beat.");
      break;
    case "book_follow_up":
      lines.push("Next step was a booked return — confirm the time and the promise.");
      break;
    case "soft_commit":
      lines.push("Soft commit last time — tighten scope and confirm the next concrete step.");
      break;
    case "hard_commit":
      lines.push("Hard commit logged — execute onboarding; proof stays support, not re-sell.");
      break;
  }

  const next = c.nextStepNeeded.trim();
  if (next && next !== "—" && next !== "None") {
    lines.push(`Expected next step: ${next}.`);
  }

  const lead = (c.leadWithNextVisit ?? "").trim();
  if (lead && lead !== "—" && lead !== "Other") {
    lines.push(`Lead with: ${lead}.`);
  }

  if (c.reuseSameRun === "yes") {
    lines.push("Same proof run worked last time — repeat unless the room clearly changed.");
  } else if (c.reuseSameRun === "no") {
    lines.push("Try a different pack or opening order than last visit.");
  } else {
    lines.push("Same run is optional — watch their first reaction before locking in.");
  }

  if (c.askMade) {
    if (c.askTiming === "too_early") {
      lines.push("Ask felt early — hold one more proof beat before you close.");
    } else if (c.askTiming === "too_late") {
      lines.push("Ask felt late — move once you see real interest.");
    } else if (c.askTiming === "on_time") {
      lines.push("Ask timing was on — keep that pacing.");
    }
  } else {
    lines.push("No ask logged — decide if you close light today or book a clean return.");
  }

  if (c.proofStrength === "weak") {
    lines.push("Proof felt weak — change the first screen or strongest moment.");
  } else if (c.proofStrength === "strong") {
    lines.push("Proof landed — keep evidence central.");
  }

  const obj = c.primaryObjection.trim();
  if (obj && obj !== "—" && obj !== "None") {
    lines.push(`Front-load a calm line on: ${obj}.`);
  }

  const note = c.notes.trim();
  if (note) {
    lines.push(`You said to change: ${note}`);
  }

  return lines.slice(0, 6);
}
