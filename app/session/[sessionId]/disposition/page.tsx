"use client";

import { useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionStageShell } from "@/components/session/SessionStageShell";
import { DispositionSurface } from "@/components/disposition/DispositionSurface";
import { useSessionStore } from "@/store/session-store";
import { useSessionPhase } from "@/hooks/useSessionPhase";
import { computeDispositionStage } from "@/lib/disposition/computeDispositionStage";

export default function DispositionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const setScore = useSessionStore((s) => s.setScore);
  const setDisposition = useSessionStore((s) => s.setDisposition);
  const setPhase = useSessionStore((s) => s.setPhase);
  const refreshPostDemoInsights = useSessionStore((s) => s.refreshPostDemoInsights);

  const { result, score } = useMemo(() => computeDispositionStage(session), [session]);

  useSessionPhase("disposition");

  useEffect(() => {
    if (!session) return;
    refreshPostDemoInsights();
  }, [
    session?.id,
    session?.proofEvents?.length,
    session?.currentProofBlockId,
    session?.closeEvents?.length,
    refreshPostDemoInsights,
  ]);

  const handleFinalize = useCallback(() => {
    if (!score || !result) return;
    setScore(score);
    setDisposition(result);
    setPhase("recap");
    router.push(`/session/${params.sessionId}/recap`);
  }, [score, result, setScore, setDisposition, setPhase, router, params.sessionId]);

  return (
    <SessionStageShell sessionId={params.sessionId}>
      {!session || !result || !score ? (
        <div className="mx-auto max-w-2xl text-sm text-muted">
          Unable to compute disposition for this session.
        </div>
      ) : (
        <DispositionSurface session={session} result={result} onFinalize={handleFinalize} />
      )}
    </SessionStageShell>
  );
}
