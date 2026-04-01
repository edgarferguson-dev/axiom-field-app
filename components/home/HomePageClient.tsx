"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Topbar } from "@/components/layout/topbar";
import { HomeHero } from "@/components/home/HomeHero";
import { SystemOverview } from "@/components/home/SystemOverview";
import { useSessionStore } from "@/store/session-store";

export function HomePageClient() {
  const router = useRouter();
  const startSession = useSessionStore((s) => s.startSession);

  const [repName, setRepName] = useState("");
  const [loading, setLoading] = useState(false);

  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!repName.trim()) return;

    setLoading(true);
    const id = startSession(repName.trim());
    router.push(`/session/${id}/field-read`);
  }

  const handleExplorePlatform = useCallback(() => {
    document.getElementById("platform-overview")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <AppShell>
      <Topbar title="Axiom Field" subtitle="Sales Execution Platform" status="Ready" />

      <main className="min-h-[calc(100vh-73px)]">
        <HomeHero
          repName={repName}
          onRepNameChange={setRepName}
          onStartSession={handleStart}
          loading={loading}
          onExplorePlatform={handleExplorePlatform}
        />
        <SystemOverview />
      </main>
    </AppShell>
  );
}
