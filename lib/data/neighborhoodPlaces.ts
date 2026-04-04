import type { NeighborhoodComparison } from "@/types/scoutIntel";

export async function fetchNeighborhoodComparison(args: {
  categoryLabel: string;
  lat: number;
  lng: number;
  excludeBusinessName?: string;
  radiusMeters?: number;
}): Promise<NeighborhoodComparison | null> {
  const { categoryLabel, lat, lng, excludeBusinessName, radiusMeters = 800 } = args;
  if (!categoryLabel.trim() || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  try {
    const res = await fetch("/api/places/neighborhood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        textQuery: categoryLabel,
        lat,
        lng,
        radiusMeters,
        excludeName: excludeBusinessName ?? "",
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as NeighborhoodComparison;
    if (typeof data.totalNearby !== "number") return null;
    return data;
  } catch {
    return null;
  }
}
