"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { SessionStageShell } from "@/components/session/SessionStageShell";
import { RecapStageSurface } from "@/components/recap/RecapStageSurface";
import { useSessionStore } from "@/store/session-store";
import { useSessionPhase } from "@/hooks/useSessionPhase";
import { useRecapPerformanceScore } from "@/hooks/useRecapPerformanceScore";
import { sessionDurationMinutes } from "@/lib/recap/sessionDuration";

export default function RecapPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const clearSession = useSessionStore((s) => s.clearSession);

  useSessionPhase("recap");
  const { loading, error, localScore } = useRecapPerformanceScore();

  const durationMin = sessionDurationMinutes(session);

  const handleNewSession = useCallback(() => {
    clearSession();
    router.push("/");
  }, [clearSession, router]);

  const handleExport = useCallback(() => {
    window.print();
  }, []);

  return (
    <SessionStageShell sessionId={params.sessionId}>
      {session ? (
        <RecapStageSurface
          session={session}
          durationMin={durationMin}
          loading={loading}
          error={error}
          localScore={localScore}
          onNewSession={handleNewSession}
          onExport={handleExport}
        />
      ) : null}
    </SessionStageShell>
  );
}
