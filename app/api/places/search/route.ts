import { NextResponse } from "next/server";

type PlacesTextSearchBody = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    internationalPhoneNumber?: string;
    rating?: number;
    userRatingCount?: number;
    websiteUri?: string;
    types?: string[];
  }>;
};

/**
 * Google Places API (New) — Text Search. Requires `GOOGLE_PLACES_API_KEY` in env.
 */
export async function POST(req: Request) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return NextResponse.json({ results: [] });
  }

  let query = "";
  try {
    const body = (await req.json()) as { query?: string };
    query = typeof body.query === "string" ? body.query.trim() : "";
  } catch {
    return NextResponse.json({ results: [] }, { status: 400 });
  }

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.types",
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 8,
        languageCode: "en",
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = (await res.json()) as PlacesTextSearchBody;
    const places = data.places ?? [];

    const results = places.map((p) => {
      const types = p.types ?? [];
      const category =
        types.find((t) => t !== "establishment" && t !== "point_of_interest") ?? types[0] ?? "business";
      return {
        provider: "google_places",
        name: p.displayName?.text ?? query,
        address: p.formattedAddress ?? "",
        phone: p.nationalPhoneNumber ?? p.internationalPhoneNumber ?? "",
        website: p.websiteUri ?? "",
        rating: typeof p.rating === "number" ? p.rating : null,
        reviewCount: typeof p.userRatingCount === "number" ? p.userRatingCount : null,
        category: category.replace(/_/g, " "),
        placeId: p.id,
      };
    });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
