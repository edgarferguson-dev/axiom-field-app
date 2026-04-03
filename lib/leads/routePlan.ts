export type RoutableStop = {
  id: string;
  lat: number;
  lng: number;
  label?: string;
};

function haversineM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return R * c;
}

/**
 * Greedy nearest-neighbor from `start` — lightweight field route, not dispatch optimization.
 */
export function planNearestNeighborRoute(stops: RoutableStop[], start: { lat: number; lng: number }): RoutableStop[] {
  if (stops.length === 0) return [];
  const remaining = [...stops];
  const ordered: RoutableStop[] = [];
  let cursor = start;

  while (remaining.length) {
    let bestI = 0;
    let bestD = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineM(cursor, remaining[i]!);
      if (d < bestD) {
        bestD = d;
        bestI = i;
      }
    }
    const next = remaining.splice(bestI, 1)[0]!;
    ordered.push(next);
    cursor = next;
  }
  return ordered;
}

export function googleMapsDirectionsUrl(stops: RoutableStop[]): string {
  if (stops.length === 0) return "https://www.google.com/maps";
  const path = stops.map((s) => `${s.lat},${s.lng}`).join("/");
  return `https://www.google.com/maps/dir/${path}`;
}

export function googleMapsStopUrl(s: RoutableStop): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.lat},${s.lng}`)}`;
}
