/** Client-safe geocode via app API. */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const a = address.trim();
  if (!a) return null;
  try {
    const res = await fetch("/api/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: a }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { lat: number | null; lng: number | null };
    if (typeof data.lat === "number" && typeof data.lng === "number") {
      return { lat: data.lat, lng: data.lng };
    }
    return null;
  } catch {
    return null;
  }
}
