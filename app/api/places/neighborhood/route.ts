import { NextResponse } from "next/server";

type PlaceRow = {
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
};

type SearchBody = { places?: PlaceRow[] };

/**
 * Aggregate nearby competitors for scout neighborhood card (~0.5 mi default).
 */
export async function POST(req: Request) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return NextResponse.json({
      totalNearby: 0,
      withBooking: 0,
      withHighRating: 0,
      avgRating: 0,
      avgReviews: 0,
    });
  }

  let textQuery = "";
  let lat = 0;
  let lng = 0;
  let radiusMeters = 800;
  let excludeName = "";
  try {
    const body = (await req.json()) as {
      textQuery?: string;
      lat?: number;
      lng?: number;
      radiusMeters?: number;
      excludeName?: string;
    };
    textQuery = typeof body.textQuery === "string" ? body.textQuery.trim() : "";
    lat = typeof body.lat === "number" ? body.lat : NaN;
    lng = typeof body.lng === "number" ? body.lng : NaN;
    radiusMeters = typeof body.radiusMeters === "number" ? body.radiusMeters : 800;
    excludeName = typeof body.excludeName === "string" ? body.excludeName.trim() : "";
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  if (!textQuery || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({
      totalNearby: 0,
      withBooking: 0,
      withHighRating: 0,
      avgRating: 0,
      avgReviews: 0,
    });
  }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.displayName,places.rating,places.userRatingCount,places.websiteUri",
      },
      body: JSON.stringify({
        textQuery,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
        maxResultCount: 10,
        languageCode: "en",
      }),
    });

    if (!res.ok) {
      return NextResponse.json({
        totalNearby: 0,
        withBooking: 0,
        withHighRating: 0,
        avgRating: 0,
        avgReviews: 0,
      });
    }

    const data = (await res.json()) as SearchBody;
    const raw = data.places ?? [];
    const places = excludeName
      ? raw.filter((p) => (p.displayName?.text ?? "").trim() !== excludeName)
      : raw;

    const n = places.length;
    if (n === 0) {
      return NextResponse.json({
        totalNearby: 0,
        withBooking: 0,
        withHighRating: 0,
        avgRating: 0,
        avgReviews: 0,
      });
    }

    const withBooking = places.filter((p) => Boolean(p.websiteUri?.trim())).length;
    const withHighRating = places.filter((p) => (p.rating ?? 0) >= 4.5).length;
    const avgRating = places.reduce((sum, p) => sum + (p.rating ?? 0), 0) / n;
    const avgReviews = places.reduce((sum, p) => sum + (p.userRatingCount ?? 0), 0) / n;

    return NextResponse.json({
      totalNearby: n,
      withBooking,
      withHighRating,
      avgRating,
      avgReviews,
    });
  } catch {
    return NextResponse.json({
      totalNearby: 0,
      withBooking: 0,
      withHighRating: 0,
      avgRating: 0,
      avgReviews: 0,
    });
  }
}
