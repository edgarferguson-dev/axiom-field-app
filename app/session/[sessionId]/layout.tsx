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
  const presentation = session?.presentation ?? createEmptyPresentation();

  const subtitle = session?.repName
    ? `${session.repName} · ${session.business?.name ?? "New Session"}`
    : "Sales Execution Platform";

  if (!hydrated) {
    return (
      <AppShell>
        <Topbar title="Axiom Field" subtitle="Sales Execution Platform" />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-muted">
          Loading session…
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Topbar title="Axiom Field" subtitle={subtitle} />
      <SessionFlowProgress presentation={presentation} phase={session?.phase} />
      {children}
      <LiveCoachingOverlay />
    </AppShell>
  );
}
