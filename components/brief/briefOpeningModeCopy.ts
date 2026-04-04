import type { OpeningMode } from "@/types/presentationPack";

/** Rep-facing labels for deck opening order (session `presentation.openingMode`). */
export function briefOpeningModeTitle(mode: OpeningMode): string {
  switch (mode) {
    case "proof-snapshot":
      return "Proof snapshot first";
    case "micro-demo":
      return "Micro-demo first";
    case "pain-to-proof":
      return "Pain → proof";
    default:
      return "Proof run order";
  }
}

export function briefOpeningModeHint(mode: OpeningMode): string {
  switch (mode) {
    case "proof-snapshot":
      return "Buyer deck opens on the snapshot beat — get their eyes on the diagnosis early, then walk the sequence.";
    case "micro-demo":
      return "Deck leads with the short flow walkthrough — good when they want to see motion before numbers.";
    case "pain-to-proof":
      return "Missed-opportunity beat lands before the hero proof — use when the room needs the pain named first.";
    default:
      return "Follow the deck order you set for this pack.";
  }
}
