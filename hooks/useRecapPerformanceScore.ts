"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/store/session-store";
import { fetchPerformanceScore } from "@/lib/recap/fetchPerformanceScore";
import type { PerformanceScore } from "@/types/session";

/**
 * Mirrors recap page score sync: hydrate from store, then POST /api/score if missing.
 * Behavior matches the previous inline useEffects on the recap route.
 */
export function useRecapPerformanceScore() {
  const session = useSessionStore((s) => s.session);
  const setScore = useSessionStore((s) => s.setScore);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localScore, setLocalScore] = useState<PerformanceScore | null>(
    () => useSessionStore.getState().session?.score ?? null
  );

  useEffect(() => {
    if (!session?.score || localScore) return;
    setLocalScore(session.score);
  }, [session?.score, localScore]);

  useEffect(() => {
    if (!session?.id || localScore) return;
    if (session.score) return;

    let cancelled = false;

    async function runFetch() {
      const payload = useSessionStore.getState().session;
      if (!payload) return;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchPerformanceScore(payload);
        if (cancelled) return;
        setScore(data);
        setLocalScore(data);
      } catch {
        if (!cancelled) setError("Unable to generate score. Check your API key.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    runFetch();
    return () => {
      cancelled = true;
    };
  }, [session?.id, session?.score, localScore, setScore]);

  return { loading, error, localScore };
}
