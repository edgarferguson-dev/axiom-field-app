"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SessionStageShell } from "@/components/session/SessionStageShell";
import { PublicPrivateSplit } from "@/components/layout/public-private-split";
import { DemoPresentationSurface } from "@/components/demo/DemoPresentationSurface";
import { DemoCoachingPanel } from "@/components/demo/DemoCoachingPanel";
import { useSessionStore } from "@/store/session-store";
import { requestCoachingPrompt } from "@/lib/coaching/requestCoachingPrompt";
import { createDemoPresentationCallbacks } from "@/lib/demo/presentationCallbacks";
import type { MaterialSummary } from "@/lib/flows/materialEngine";
import type { CoachingPrompt } from "@/types/session";

export default function DemoPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const addCoachingPrompt = useSessionStore((s) => s.addCoachingPrompt);
  const setRepNotes = useSessionStore((s) => s.setRepNotes);
  const setPhase = useSessionStore((s) => s.setPhase);
  const markStarted = useSessionStore((s) => s.markStarted);
  const applyPresentationMaterial = useSessionStore((s) => s.applyPresentationMaterial);
  const addSignal = useSessionStore((s) => s.addSignal);
  const addObjection = useSessionStore((s) => s.addObjection);
  const addSalesStep = useSessionStore((s) => s.addSalesStep);

  useEffect(() => {
    if (!session) return;
    setPhase("live-demo");
  }, [session?.id, setPhase]);

  const [loadingCoach, setLoadingCoach] = useState(false);
  const [activePrompt, setActivePrompt] = useState<CoachingPrompt | null>(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proceedToPricingSignal, setProceedToPricingSignal] = useState(0);

  const presentationHandlers = useMemo(
    () =>
      createDemoPresentationCallbacks({
        addSignal,
        addObjection,
        addSalesStep,
        addCoachingPrompt,
      }),
    [addSignal, addObjection, addSalesStep, addCoachingPrompt]
  );

  const handleStart = useCallback(() => {
    markStarted();
    setPhase("live-demo");
    setStarted(true);
  }, [markStarted, setPhase]);

  const handleGetCoaching = useCallback(async () => {
    if (!session?.business || !session?.preCallIntel) return;
    setLoadingCoach(true);
    setError(null);
    try {
      const prompt = await requestCoachingPrompt({
        business: session.business,
        preCallIntel: session.preCallIntel,
        repNotes: session.repNotes,
        previousPromptCount: session.coachingPrompts.length,
      });
      addCoachingPrompt(prompt);
      setActivePrompt(prompt);
    } catch {
      setError("Failed to get coaching. Check your API key.");
    } finally {
      setLoadingCoach(false);
    }
  }, [session, addCoachingPrompt]);

  const handleEndSession = useCallback(() => {
    setPhase("offer-fit");
    router.push(`/session/${params.sessionId}/offer-fit`);
  }, [setPhase, router, params.sessionId]);

  const handleJumpToPricing = useCallback(() => {
    setProceedToPricingSignal((n) => n + 1);
  }, []);

  const handleMaterialIngest = useCallback(
    (summary: MaterialSummary) => {
      applyPresentationMaterial(summary);
    },
    [applyPresentationMaterial]
  );

  return (
    <SessionStageShell sessionId={params.sessionId}>
      <PublicPrivateSplit
        surface="continuous"
        publicPane={
          <DemoPresentationSurface
            business={session?.business}
            started={started}
            onStart={handleStart}
            proceedToPricingSignal={proceedToPricingSignal}
            presentationHandlers={presentationHandlers}
          />
        }
        privatePane={
          <DemoCoachingPanel
            started={started}
            intel={session?.preCallIntel}
            activePrompt={activePrompt}
            loadingCoach={loadingCoach}
            error={error}
            onGetCoaching={handleGetCoaching}
            onJumpToPricing={handleJumpToPricing}
            onMaterialIngest={handleMaterialIngest}
            repNotes={session?.repNotes ?? ""}
            onRepNotesChange={setRepNotes}
            coachingPromptCount={session?.coachingPrompts.length ?? 0}
            onEndSession={handleEndSession}
          />
        }
      />
    </SessionStageShell>
  );
}
