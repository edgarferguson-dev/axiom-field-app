"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/store/session-store";

/**
 * True after Zustand persist has rehydrated from storage (or immediately if no pending rehydration).
 * Use so session routes don't treat a pre-hydration `session === null` as "no session".
 */
export function useSessionStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(useSessionStore.persist.hasHydrated());
    return useSessionStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}
