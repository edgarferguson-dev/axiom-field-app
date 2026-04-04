/** Pull a short neighborhood label from a formatted address (best-effort). */
export function extractNeighborhood(address: string | undefined | null): string {
  if (!address?.trim()) return "your area";
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return parts[parts.length - 2] ?? parts[0]!;
  }
  return parts[0] ?? "your area";
}
