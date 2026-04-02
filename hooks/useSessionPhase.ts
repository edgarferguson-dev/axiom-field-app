"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/session-store";
import type { SessionPhase } from "@/types/session";

/** Keeps persisted `session.phase` aligned with the active route — same logic as inline effects on session pages. */
export function useSessionPhase(phase: SessionPhase) {
  const session = useSessionStore((s) => s.session);
  const setPhase = useSessionStore((s) => s.setPhase);

  useEffect(() => {
    if (!session) return;
    setPhase(phase);
  }, [session?.id, setPhase, phase]);
}
