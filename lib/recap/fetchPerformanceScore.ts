import type { PerformanceScore, Session } from "@/types/session";

export async function fetchPerformanceScore(session: Session): Promise<PerformanceScore> {
  const res = await fetch("/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  });
  if (!res.ok) throw new Error("API error");
  return res.json() as Promise<PerformanceScore>;
}
