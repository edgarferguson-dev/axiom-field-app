"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/store/session-store";

/**
 * True when the client may render UI that reads persisted session state.
 *
 * Server and first paint: always `false` (avoids SSR/client HTML mismatch).
 *
 * **Fail-open:** Zustand’s `persist` does not set `hasHydrated` or call
 * `onFinishHydration` when `hydrate()` rejects (e.g. corrupt JSON in storage).
 * We also schedule the fail-open timer *before* touching `persist` APIs so a
 * synchronous throw from `hasHydrated` / `onFinishHydration` cannot skip the
 * timer — otherwise session routes stay on “Loading session…” forever.
 */
export function useSessionStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const done = () => setHydrated(true);
    let unsub: (() => void) | undefined;

    const failOpenMs = 800;
    const timer =
      typeof window !== "undefined" ? window.setTimeout(done, failOpenMs) : undefined;

    try {
      const persistApi = useSessionStore.persist;
      if (persistApi?.hasHydrated?.()) {
        done();
      } else if (persistApi) {
        unsub = persistApi.onFinishHydration?.(done);
      } else {
        done();
      }
    } catch {
      done();
    }

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      try {
        unsub?.();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return hydrated;
}
