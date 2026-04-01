"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Topbar } from "@/components/layout/topbar";
import { SessionFlowProgress } from "@/components/layout/session-flow-progress";
import { LiveCoachingOverlay } from "@/components/coaching/LiveCoachingOverlay";
import { useSessionStore } from "@/store/session-store";
import { createEmptyPresentation } from "@/types/presentation";
import { useSessionStoreHydrated } from "@/hooks/use-session-store-hydrated";

export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrated = useSessionStoreHydrated();
  const session = useSessionStore((s) => s.session);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background p-6 text-sm text-muted">
        Loading session…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background p-6 text-sm text-muted">
        <p>No active session in storage.</p>
        <a href="/" className="mt-2 inline-block text-accent underline">
          Return home to start a session
        </a>
      </div>
    );
  }

  const presentation = session.presentation ?? createEmptyPresentation();

  const subtitle = session.repName
    ? `${session.repName} · ${session.business?.name ?? "New Session"}`
    : "Sales Execution Platform";

  return (
    <AppShell>
      <Topbar title="Axiom Field" subtitle={subtitle} />
      <SessionFlowProgress presentation={presentation} phase={session.phase} />
      {children}
      <LiveCoachingOverlay />
    </AppShell>
  );
}
