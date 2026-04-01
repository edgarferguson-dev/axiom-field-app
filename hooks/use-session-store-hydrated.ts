"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/store/session-store";

/**
 * True after Zustand persist has rehydrated from storage.
 *
 * Checks synchronously in the useState initializer so that client-side navigation
 * (where hydration completed long before this component mounts) never shows a loading
 * flash. Falls back to the onFinishHydration subscription for the initial full-page-load
 * case where hydration may still be in progress.
 */
export function useSessionStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState<boolean>(() => {
    // Server: no localStorage, hydration never runs — always false.
    if (typeof window === "undefined") return false;
    // Client: if the store already hydrated (common on client-side nav), return true now.
    return useSessionStore.persist.hasHydrated();
  });

  useEffect(() => {
    // Re-check after mount in case hydration completed between the initial render
    // and this effect (race window on first full-page load).
    if (useSessionStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    // Still hydrating — subscribe and wait.
    return useSessionStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
