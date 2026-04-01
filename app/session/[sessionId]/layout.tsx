"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Topbar } from "@/components/layout/topbar";
import { ProgressHeader } from "@/components/layout/progress-header";
import { LiveCoachingOverlay } from "@/components/coaching/LiveCoachingOverlay";
import { useSessionStore } from "@/store/session-store";
import type { SessionPhase } from "@/types/session";

function getPhaseFromPath(pathname: string): SessionPhase {
  if (pathname.includes("/demo")) return "live-demo";
  if (pathname.includes("/disposition")) return "debrief";
  if (pathname.includes("/recap")) return "debrief";
  return "pre-call";
}

export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const phase = getPhaseFromPath(pathname);
  const session = useSessionStore((s) => s.session);

  const subtitle = session?.repName
    ? `${session.repName} · ${session.business?.name ?? "New Session"}`
    : "Sales Execution Platform";

  return (
    <AppShell>
      <Topbar
        title="Axiom Field"
        subtitle={subtitle}
        status={phase === "live-demo" ? "● Live" : "Active"}
      />
      <ProgressHeader currentPhase={phase} />
      {children}
      <LiveCoachingOverlay />
    </AppShell>
  );
}
