"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/store/session-store";

/**
 * True after Zustand persist has rehydrated from storage.
 *
 * Initial state is always `false` on the server and on the client's first paint.
 * Reading `hasHydrated()` only inside `useEffect` avoids SSR/client HTML mismatch
 * (otherwise the client can render the loaded shell while the server sent "loading",
 * which triggers React hydration errors and Next.js "Application error: client-side exception").
 */
export function useSessionStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useSessionStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useSessionStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
