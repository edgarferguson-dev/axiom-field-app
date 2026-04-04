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
    location?: { latitude?: number; longitude?: number };
    primaryType?: string;
  }>;
};

type RequestJson = {
  query?: string;
  locationBias?: {
    circle?: {
      center?: { latitude?: number; longitude?: number };
      radius?: number;
    };
  };
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
  let locationBias: RequestJson["locationBias"] | undefined;
  try {
    const body = (await req.json()) as RequestJson;
    query = typeof body.query === "string" ? body.query.trim() : "";
    locationBias = body.locationBias;
  } catch {
    return NextResponse.json({ results: [] }, { status: 400 });
  }

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const defaultBrooklyn = {
    circle: {
      center: { latitude: 40.6782, longitude: -73.9442 },
      radius: 15000,
    },
  };

  try {
    const payload: Record<string, unknown> = {
      textQuery: query,
      maxResultCount: 8,
      languageCode: "en",
    };

    const circle = locationBias?.circle?.center;
    if (
      circle &&
      typeof circle.latitude === "number" &&
      typeof circle.longitude === "number" &&
      Number.isFinite(circle.latitude) &&
      Number.isFinite(circle.longitude)
    ) {
      payload.locationBias = {
        circle: {
          center: { latitude: circle.latitude, longitude: circle.longitude },
          radius: locationBias?.circle?.radius ?? defaultBrooklyn.circle.radius,
        },
      };
    } else {
      payload.locationBias = defaultBrooklyn;
    }

    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.types,places.location,places.primaryType",
      },
      body: JSON.stringify(payload),
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
      const pt = p.primaryType ?? category;
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
        latitude: typeof p.location?.latitude === "number" ? p.location.latitude : null,
        longitude: typeof p.location?.longitude === "number" ? p.location.longitude : null,
        primaryType: pt,
      };
    });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
