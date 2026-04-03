import { createJSONStorage } from "zustand/middleware";

/** In-memory Web Storage shape when real `localStorage` is unavailable. */
function noopWebStorage(): Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}

function wrapStorage(store: Storage): Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  return {
    getItem: (name: string) => {
      try {
        return store.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      try {
        store.setItem(name, value);
      } catch {
        /* quota / blocked */
      }
    },
    removeItem: (name: string) => {
      try {
        store.removeItem(name);
      } catch {
        /* ignore */
      }
    },
  };
}

/**
 * Prefer `localStorage`, then `sessionStorage` if the former throws or cannot write.
 * Strict private / locked-down profiles often reject `localStorage` while `sessionStorage`
 * still works for the tab — enough for refresh to keep the session.
 */
function pickWritableStorage(): Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  if (typeof window === "undefined") {
    return noopWebStorage();
  }
  try {
    const candidates: Array<Storage | null | undefined> = [
      window.localStorage,
      window.sessionStorage,
    ];
    for (const store of candidates) {
      try {
        if (!store) continue;
        const k = "__axiom_probe__";
        store.setItem(k, "1");
        store.removeItem(k);
        return wrapStorage(store);
      } catch {
        continue;
      }
    }
  } catch {
    /* SecurityError touching window.storage */
  }
  return noopWebStorage();
}

/**
 * Zustand `persist` storage. Accessing `window.localStorage` can throw (SecurityError).
 * If `createJSONStorage`’s getStorage() throws, Zustand omits `api.persist`, which breaks
 * `useSessionStore.persist.hasHydrated()` — so we always return a safe adapter.
 */
function safeLocal() {
  return () => pickWritableStorage();
}

const baseJson =
  createJSONStorage(safeLocal()) ?? createJSONStorage(() => noopWebStorage());
if (!baseJson) {
  throw new Error("[axiom] session storage could not be initialized");
}

export const sessionPersistStorage = {
  getItem: (name: string) => {
    try {
      const r = baseJson.getItem(name);
      if (r instanceof Promise) {
        return r.catch(() => null);
      }
      return r;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: Parameters<typeof baseJson.setItem>[1]) => {
    try {
      return baseJson.setItem(name, value);
    } catch {
      /* ignore */
    }
  },
  removeItem: (name: string) => {
    try {
      return baseJson.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};
