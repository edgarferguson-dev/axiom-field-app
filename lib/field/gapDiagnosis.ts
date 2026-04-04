import type { BusinessProfile } from "@/types/session";
import type { GapDiagnosis, GapItem } from "@/types/scoutIntel";

function parseRating(rating?: string): number | null {
  if (rating == null || rating === "") return null;
  const n = Number.parseFloat(String(rating).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseReviewCount(raw?: string): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseInt(String(raw).replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

export function getAvgTicket(category: string): number {
  const tickets: Record<string, number> = {
    "Barber Shop": 35,
    "Beauty Salon": 65,
    "Hair Salon": 55,
    "Nail Salon": 50,
    "Spa / Med Spa": 85,
    "Gym / Personal Training": 80,
    "CPA / Accounting": 250,
    Contractor: 500,
    Restaurant: 30,
  };
  return tickets[category] ?? 50;
}

export function mapPlacesPrimaryType(primaryType: string | undefined): string {
  if (!primaryType) return "Business";
  const map: Record<string, string> = {
    barber_shop: "Barber Shop",
    beauty_salon: "Beauty Salon",
    hair_salon: "Hair Salon",
    nail_salon: "Nail Salon",
    gym: "Gym / Personal Training",
    spa: "Spa / Med Spa",
    accounting: "CPA / Accounting",
    electrician: "Contractor",
    plumber: "Contractor",
    general_contractor: "Contractor",
    restaurant: "Restaurant",
  };
  const hit = map[primaryType];
  if (hit) return hit;
  return primaryType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function diagnoseGaps(scout: BusinessProfile, placesPrimaryType?: string | null): GapDiagnosis {
  const gaps: GapItem[] = [];
  const category = scout.type?.trim() || mapPlacesPrimaryType(placesPrimaryType ?? undefined);
  const avgTicket = getAvgTicket(category);

  gaps.push({
    type: "no-auto-reply",
    label: "No auto-reply on missed calls",
    severity: "high",
  });

  const website = scout.website?.trim() ?? "";
  if (!website || !/book|schedule|appoint|reserve/i.test(website)) {
    gaps.push({
      type: "no-booking",
      label: "No online booking found",
      severity: "high",
    });
  }

  const reviewCount = parseReviewCount(scout.reviewCount);
  if (reviewCount !== null && reviewCount < 20) {
    gaps.push({
      type: "low-reviews",
      label: `Only ${reviewCount} Google reviews`,
      severity: "medium",
    });
  }

  const googleRating = parseRating(scout.rating);
  if (googleRating !== null && googleRating < 4.0) {
    gaps.push({
      type: "low-rating",
      label: `${googleRating}-star rating`,
      severity: "medium",
    });
  }

  const primaryGap = googleRating !== null && googleRating < 3.0 ? "low-rating" : "no-auto-reply";
  const missedPerWeek = 8;
  const leakage = missedPerWeek * avgTicket * 4;

  return { gaps, primaryGap, estimatedMonthlyLeakage: leakage, avgTicket };
}
