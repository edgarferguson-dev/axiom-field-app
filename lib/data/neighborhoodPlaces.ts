import type { NeighborhoodComparison } from "@/types/scoutIntel";
import { neighborhoodDataIsUseful } from "@/types/scoutIntel";

export type NeighborhoodFetchResult =
  | { kind: "success"; data: NeighborhoodComparison }
  | { kind: "empty" }
  | { kind: "error" };

export async function fetchNeighborhoodComparison(args: {
  categoryLabel: string;
  lat: number;
  lng: number;
  excludeBusinessName?: string;
  radiusMeters?: number;
}): Promise<NeighborhoodFetchResult> {
  const { categoryLabel, lat, lng, excludeBusinessName, radiusMeters = 800 } = args;
  if (!categoryLabel.trim() || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { kind: "error" };
  }

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
    if (!res.ok) return { kind: "error" };
    const data = (await res.json()) as NeighborhoodComparison;
    if (typeof data.totalNearby !== "number" || !Number.isFinite(data.totalNearby)) {
      return { kind: "error" };
    }
    if (!neighborhoodDataIsUseful(data)) {
      return { kind: "empty" };
    }
    return { kind: "success", data };
  } catch {
    return { kind: "error" };
  }
}
