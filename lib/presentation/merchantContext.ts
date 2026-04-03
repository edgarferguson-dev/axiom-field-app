import type { BusinessProfile } from "@/types/session";

/** Short display name — avoids empty strings */
export function merchantShortName(business: BusinessProfile | null | undefined): string {
  const n = business?.name?.trim();
  return n && n.length > 0 ? n : "this business";
}

/** First line of address for “your block / strip” flavor — safe trim only */
export function merchantPlaceHint(business: BusinessProfile | null | undefined): string | undefined {
  const a = business?.address?.trim();
  if (!a) return undefined;
  const first = a.split(/[,;]/)[0]?.trim();
  return first && first.length > 2 ? first.slice(0, 48) : undefined;
}

/** Noun phrase for appointment-style runs from business type string */
export function appointmentVenuePhrase(type: string | undefined | null): string {
  const t = (type ?? "").toLowerCase();
  if (/barber/.test(t)) return "the chair book";
  if (/nail|salon|beauty|spa|esthetic/.test(t)) return "the appointment book";
  if (/trainer|fitness|gym|yoga|pilates/.test(t)) return "the session calendar";
  if (/med|clinic|dental|vet/.test(t)) return "the schedule";
  if (/tattoo|pierc/.test(t)) return "the book";
  return "the calendar";
}

/** Noun for inquiry-style runs */
export function inquiryVenuePhrase(type: string | undefined | null): string {
  const t = (type ?? "").toLowerCase();
  if (/cpa|account|tax|bookkeep/.test(t)) return "client intake";
  if (/contract|plumb|electric|hvac|roof|landscape|clean/.test(t)) return "job requests";
  if (/legal|law|attorney/.test(t)) return "new matters";
  if (/real\s*estate|realtor/.test(t)) return "buyer leads";
  return "incoming leads";
}
