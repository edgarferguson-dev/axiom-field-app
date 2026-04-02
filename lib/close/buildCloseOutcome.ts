import type { CloseOutcome, CloseOutcomeType } from "@/types/session";

export type CloseFormFields = {
  selected: CloseOutcomeType | null;
  packageSelected: string;
  proposalRecipient: string;
  decisionMakerName: string;
  followUpReason: string;
  followUpTiming: string;
  lossReason: string;
  notes: string;
};

export function buildCloseOutcome(fields: CloseFormFields): CloseOutcome | null {
  if (!fields.selected) return null;
  return {
    type: fields.selected,
    packageSelected: fields.packageSelected || undefined,
    proposalRecipient: fields.proposalRecipient || undefined,
    decisionMakerName: fields.decisionMakerName || undefined,
    followUpReason: fields.followUpReason || undefined,
    followUpTiming: fields.followUpTiming || undefined,
    lossReason: fields.lossReason || undefined,
    notes: fields.notes || undefined,
  };
}
