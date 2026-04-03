import type { MerchantTransitionIntent } from "@/types/merchantProof";

/** Private UI — short next-move chip */
export function transitionIntentLabel(intent: MerchantTransitionIntent): string {
  switch (intent) {
    case "continue_proof":
      return "Then: next proof beat";
    case "ask_question":
      return "Lead: question first";
    case "hold_silence":
      return "Discipline: wait";
    case "move_to_ask":
      return "Then: pilot / numbers";
    case "answer_concern":
      return "Then: short answer → advance";
    default:
      return "Next";
  }
}
