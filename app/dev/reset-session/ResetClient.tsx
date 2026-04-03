"use client";

import { useRouter } from "next/navigation";
import { clearAxiomPersistedState } from "@/lib/storage/clearAxiomPersistedState";

export function DevResetClient() {
  const router = useRouter();

  function handleClearAndReload() {
    clearAxiomPersistedState();
    router.refresh();
    window.location.assign("/");
  }

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-md flex-col justify-center gap-4 px-4 py-8">
      <h1 className="text-lg font-semibold text-foreground">Reset persisted state</h1>
      <p className="text-sm text-muted">
        Clears session + materials cache from localStorage, then reloads the home page. Development
        only.
      </p>
      <button
        type="button"
        onClick={handleClearAndReload}
        className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white"
      >
        Clear &amp; reload
      </button>
      <a href="/" className="text-center text-sm text-accent underline">
        Cancel — home
      </a>
    </main>
  );
}
