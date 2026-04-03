/**
 * RFC 7 — Multi-pack proof-led presentation (registry + opening modes).
 * Pack definitions and asset keys live in code/config — not in Zustand.
 */

export type OpeningMode = "proof-snapshot" | "micro-demo" | "pain-to-proof";

export const DEFAULT_PRESENTATION_PACK_ID = "appointment-local";

export const DEFAULT_OPENING_MODE: OpeningMode = "proof-snapshot";
