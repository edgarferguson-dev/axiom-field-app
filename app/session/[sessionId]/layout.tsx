"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Topbar } from "@/components/layout/topbar";
import { SessionFlowProgress } from "@/components/layout/session-flow-progress";
import { LiveCoachingOverlay } from "@/components/coaching/LiveCoachingOverlay";
import { useSessionStore } from "@/store/session-store";
import { createEmptyPresentation } from "@/types/presentation";

export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSessionStore((s) => s.session);
  const presentation = session?.presentation ?? createEmptyPresentation();

  const subtitle = session?.repName
    ? `${session.repName} · ${session.business?.name ?? "New Session"}`
    : "Sales Execution Platform";

  return (
    <AppShell>
      <Topbar title="Axiom Field" subtitle={subtitle} />
      <SessionFlowProgress presentation={presentation} phase={session?.phase} />
      {children}
      <LiveCoachingOverlay />
    </AppShell>
  );
}
