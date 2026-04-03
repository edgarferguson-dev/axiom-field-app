import { NextResponse } from "next/server";

/**
 * Server geocode — uses Google Geocoding API if key present.
 * Key: `GOOGLE_GEOCODING_API_KEY` or `GOOGLE_PLACES_API_KEY`.
 */
export async function POST(req: Request) {
  const key = process.env.GOOGLE_GEOCODING_API_KEY ?? process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return NextResponse.json({ lat: null, lng: null });
  }

  let address = "";
  try {
    const body = (await req.json()) as { address?: string };
    address = typeof body.address === "string" ? body.address.trim() : "";
  } catch {
    return NextResponse.json({ lat: null, lng: null }, { status: 400 });
  }

  if (!address) {
    return NextResponse.json({ lat: null, lng: null });
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", address);
    url.searchParams.set("key", key);
    const res = await fetch(url.toString());
    if (!res.ok) return NextResponse.json({ lat: null, lng: null });
    const data = (await res.json()) as {
      results?: { geometry?: { location?: { lat: number; lng: number } } }[];
    };
    const loc = data.results?.[0]?.geometry?.location;
    if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
      return NextResponse.json({ lat: loc.lat, lng: loc.lng });
    }
    return NextResponse.json({ lat: null, lng: null });
  } catch {
    return NextResponse.json({ lat: null, lng: null });
  }
}
