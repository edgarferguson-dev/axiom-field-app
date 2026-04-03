import { PERSIST_KEY_LEADS, PERSIST_KEY_MATERIALS, PERSIST_KEY_SESSION } from "@/lib/storage/persistKeys";

const KEYS = [PERSIST_KEY_SESSION, PERSIST_KEY_MATERIALS, PERSIST_KEY_LEADS] as const;

/**
 * Removes persisted Zustand slices from localStorage (browser only).
 * Safe to call when storage is unavailable or throws.
 */
export function clearAxiomPersistedState(): void {
  if (typeof window === "undefined") return;
  let ls: Storage;
  try {
    ls = window.localStorage;
  } catch {
    return;
  }
  for (const key of KEYS) {
    try {
      ls.removeItem(key);
    } catch {
      /* private mode / quota */
    }
  }
}
