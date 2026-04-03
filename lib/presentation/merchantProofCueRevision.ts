/**
 * Builder reference: ordered keys on `MerchantProofBeatCue`.
 * Edit copy in `lib/presentation/merchantProofRuns.ts` (`cue({ ... })`).
 * Optional keys render in `MerchantProofCoachRail` when set.
 */
import type { MerchantProofBeatCue } from "@/types/merchantProof";

export const MERCHANT_PROOF_BEAT_CUE_KEYS = [
  "beatId",
  "proofPurpose",
  "openingQuestion",
  "reactionProbe",
  "silenceCue",
  "privateCoachCue",
  "positiveSignalCue",
  "hesitationCue",
  "objectionCue",
  "askWording",
  "transitionTrigger",
  "transitionIntent",
] as const satisfies readonly (keyof MerchantProofBeatCue)[];

export type MerchantProofBeatCueKey = (typeof MERCHANT_PROOF_BEAT_CUE_KEYS)[number];
