"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CommandCenter } from "@/components/home/CommandCenter";
import { useSessionStore } from "@/store/session-store";
import { useSessionStoreHydrated } from "@/hooks/use-session-store-hydrated";

export function HomePageClient() {
  const router = useRouter();
  const hydrated = useSessionStoreHydrated();
  const [forceReady, setForceReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setForceReady(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const ready = hydrated || forceReady;
  const startSession = useSessionStore((s) => s.startSession);
  const session = useSessionStore((s) => s.session);
  const sessionHistory = useSessionStore((s) => s.sessionHistory ?? []);

  const [repName, setRepName] = useState("");
  const [loading, setLoading] = useState(false);

  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!repName.trim()) return;

    setLoading(true);
    const id = startSession(repName.trim());
    router.push(`/session/${id}/field-read`);
  }

  if (!ready) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-accent/20 border-t-accent"
          aria-hidden
        />
        <p className="text-sm text-muted">Loading workspace…</p>
      </main>
    );
  }

  return (
    <main className="min-h-0">
      <CommandCenter
        repName={repName}
        onRepNameChange={setRepName}
        onStartSession={handleStart}
        loading={loading}
        sessionId={session?.id ?? null}
        sessionRepName={session?.repName ?? null}
        sessionHistory={sessionHistory}
      />
    </main>
  );
}
