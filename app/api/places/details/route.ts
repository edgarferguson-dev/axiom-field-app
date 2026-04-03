import { NextResponse } from "next/server";

/**
 * Google Places API (New) — place details. `placeId` is full resource name e.g. `places/ChIJ...`
 */
export async function POST(req: Request) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return NextResponse.json({ match: null });
  }

  let placeId = "";
  try {
    const body = (await req.json()) as { placeId?: string };
    placeId = typeof body.placeId === "string" ? body.placeId.trim() : "";
  } catch {
    return NextResponse.json({ match: null }, { status: 400 });
  }

  if (!placeId || !placeId.startsWith("places/")) {
    return NextResponse.json({ match: null });
  }

  try {
    const res = await fetch(`https://places.googleapis.com/v1/${placeId}`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,rating,userRatingCount,websiteUri,types",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ match: null });
    }

    const p = (await res.json()) as {
      id?: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      nationalPhoneNumber?: string;
      internationalPhoneNumber?: string;
      rating?: number;
      userRatingCount?: number;
      websiteUri?: string;
      types?: string[];
    };

    const types = p.types ?? [];
    const category =
      types.find((t) => t !== "establishment" && t !== "point_of_interest") ?? types[0] ?? "business";

    const match = {
      provider: "google_places" as const,
      placeId: p.id,
      name: p.displayName?.text ?? "",
      address: p.formattedAddress ?? "",
      phone: p.nationalPhoneNumber ?? p.internationalPhoneNumber ?? "",
      website: p.websiteUri ?? "",
      rating: typeof p.rating === "number" ? p.rating : null,
      reviewCount: typeof p.userRatingCount === "number" ? p.userRatingCount : null,
      category: category.replace(/_/g, " "),
    };

    return NextResponse.json({ match });
  } catch {
    return NextResponse.json({ match: null });
  }
}
