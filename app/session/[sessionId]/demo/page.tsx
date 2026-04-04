"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SessionStageShell } from "@/components/session/SessionStageShell";
import { DemoModeToggle } from "@/components/demo/DemoModeToggle";
import { PublicScreen } from "@/components/demo/PublicScreen";
import { PrivateScreen } from "@/components/demo/PrivateScreen";
import { CommandModeBar } from "@/components/ui/CommandModeBar";
import { DemoShareLinkHint } from "@/components/demo/DemoShareLinkHint";
import { useSessionStore } from "@/store/session-store";
import { requestCoachingPrompt } from "@/lib/coaching/requestCoachingPrompt";
import { createDemoPresentationCallbacks } from "@/lib/demo/presentationCallbacks";
import type { PresentationEndAction } from "@/components/presentation/PresentationEngine";
import type { CoachingPrompt } from "@/types/session";
import { cn } from "@/lib/utils/cn";
import { canEnterProofRun } from "@/lib/proofRun/canEnterProofRun";

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
  const addSignal = useSessionStore((s) => s.addSignal);
  const addObjection = useSessionStore((s) => s.addObjection);
  const addSalesStep = useSessionStore((s) => s.addSalesStep);
  const setCloseOutcome = useSessionStore((s) => s.setCloseOutcome);
  const markCompleted = useSessionStore((s) => s.markCompleted);
  const setSignal = useSessionStore((s) => s.setSignal);
  const dealSignal = useSessionStore((s) => s.signal);
  const commandMode = useSessionStore((s) => s.commandMode);
  const setPresentationOpenAccountStarted = useSessionStore((s) => s.setPresentationOpenAccountStarted);
  const demoViewMode = useSessionStore((s) => s.demoViewMode);
  const setDemoViewMode = useSessionStore((s) => s.setDemoViewMode);
  const initializeProofState = useSessionStore((s) => s.initializeProofState);
  const refreshDemoInsightLayer = useSessionStore((s) => s.refreshDemoInsightLayer);
  const liveSignal = useSessionStore((s) => s.signal);
  const buyerState = useSessionStore((s) => s.buyerState);
  const setLiveDemoBuyerStarted = useSessionStore((s) => s.setLiveDemoBuyerStarted);
  const proofRunDispatch = useSessionStore((s) => s.proofRunDispatch);
  const setPresentationActiveSlideIndex = useSessionStore((s) => s.setPresentationActiveSlideIndex);

  useEffect(() => {
    if (!session) return;
    setPhase("live-demo");
  }, [session?.id, setPhase]);

  useEffect(() => {
    if (!session) return;
    initializeProofState();
  }, [session?.id, initializeProofState]);

  useEffect(() => {
    if (!session) return;
    refreshDemoInsightLayer();
  }, [
    session?.id,
    session?.proofEvents?.length,
    session?.currentProofBlockId,
    session?.proofAssessment?.proofConfidence,
    session?.closeEvents?.length,
    liveSignal,
    buyerState,
    refreshDemoInsightLayer,
  ]);

  const [loadingCoach, setLoadingCoach] = useState(false);
  const [activePrompt, setActivePrompt] = useState<CoachingPrompt | null>(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proceedToPricingSignal, setProceedToPricingSignal] = useState(0);

  useEffect(() => {
    if (started) return;
    setPresentationActiveSlideIndex(0);
  }, [session?.id, started, setPresentationActiveSlideIndex]);

  useEffect(() => {
    if (activePrompt?.signal) {
      setSignal(activePrompt.signal);
    }
  }, [activePrompt?.signal, setSignal]);

  const presentationHandlers = useMemo(
    () =>
      createDemoPresentationCallbacks({
        addSignal,
        addObjection,
        addSalesStep,
        addCoachingPrompt,
        setDealSignal: setSignal,
      }),
    [addSignal, addObjection, addSalesStep, addCoachingPrompt, setSignal]
  );

  const canStartProofRun = session ? canEnterProofRun(session) : false;

  const handleStart = useCallback(() => {
    if (!canStartProofRun) return;
    proofRunDispatch({ type: "start" });
    markStarted();
    setPhase("live-demo");
    setStarted(true);
    setLiveDemoBuyerStarted(true);
  }, [
    canStartProofRun,
    proofRunDispatch,
    markStarted,
    setPhase,
    setLiveDemoBuyerStarted,
  ]);

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
    useSessionStore.getState().proofRunDispatch({ type: "exit", reason: "private_end_session" });
    setLiveDemoBuyerStarted(false);
    setPhase("offer-fit");
    router.push(`/session/${params.sessionId}/offer-fit`);
  }, [setPhase, router, params.sessionId, setLiveDemoBuyerStarted]);

  const handleJumpToPricing = useCallback(() => {
    setProceedToPricingSignal((n) => n + 1);
  }, []);

  const handlePresentationAction = useCallback(
    (action: PresentationEndAction) => {
      const id = params.sessionId;
      useSessionStore.getState().proofRunDispatch({
        type: "exit",
        reason: `presentation_action:${action}`,
      });
      setLiveDemoBuyerStarted(false);
      switch (action) {
        case "start-setup":
          addSignal("green");
          setSignal("green");
          setPhase("offer-fit");
          router.push(`/session/${id}/offer-fit`);
          break;
        case "book-follow-up":
          setCloseOutcome({ type: "follow-up-booked", followUpTiming: "This week" });
          markCompleted();
          setPhase("disposition");
          router.push(`/session/${id}/disposition`);
          break;
        case "revisit-pain":
          addSignal("yellow");
          setSignal("yellow");
          setPhase("field-read");
          router.push(`/session/${id}/field-read`);
          break;
        case "needs-review":
          setCloseOutcome({ type: "interested-not-ready" });
          markCompleted();
          setPhase("disposition");
          router.push(`/session/${id}/disposition`);
          break;
        case "not-fit":
          setCloseOutcome({ type: "not-qualified" });
          markCompleted();
          setPhase("disposition");
          router.push(`/session/${id}/disposition`);
          break;
      }
    },
    [
      params.sessionId,
      addSignal,
      setSignal,
      setPhase,
      router,
      setCloseOutcome,
      markCompleted,
      setLiveDemoBuyerStarted,
    ]
  );

  const showCommandBar = started && dealSignal === "green" && commandMode;

  const handleOpenAccount = useCallback(() => {
    useSessionStore.getState().proofRunDispatch({ type: "exit", reason: "command_open_account" });
    setLiveDemoBuyerStarted(false);
    setPresentationOpenAccountStarted(true);
    setPhase("offer-fit");
    router.push(`/session/${params.sessionId}/offer-fit`);
  }, [
    setPresentationOpenAccountStarted,
    setPhase,
    router,
    params.sessionId,
    setLiveDemoBuyerStarted,
  ]);

  const handleReinforceValue = useCallback(() => {
    handleJumpToPricing();
  }, [handleJumpToPricing]);

  return (
    <SessionStageShell
      sessionId={params.sessionId}
      className={
        demoViewMode === "public"
          ? "max-w-none px-2 py-6 sm:px-5 md:px-10 md:py-10 lg:px-14"
          : undefined
      }
    >
      <div className={cn("space-y-6", showCommandBar && "pb-[7.5rem]")}>
        <div className="flex justify-center px-2">
          <DemoModeToggle mode={demoViewMode} onChange={setDemoViewMode} className="w-full sm:max-w-2xl" />
        </div>

        {demoViewMode === "private" && (
          <div className="mx-auto max-w-lg px-2">
            <DemoShareLinkHint />
          </div>
        )}

        {demoViewMode === "public" ? (
          <PublicScreen
            business={session?.business}
            started={started}
            onStart={handleStart}
            proceedToPricingSignal={proceedToPricingSignal}
            presentationHandlers={presentationHandlers}
            onPresentationAction={handlePresentationAction}
            sessionId={params.sessionId}
            canStartProofRun={canStartProofRun}
          />
        ) : (
          <PrivateScreen
            started={started}
            intel={session?.preCallIntel}
            fieldEngagementDecision={session?.fieldEngagementDecision}
            activePrompt={activePrompt}
            loadingCoach={loadingCoach}
            error={error}
            onGetCoaching={handleGetCoaching}
            onJumpToPricing={handleJumpToPricing}
            repNotes={session?.repNotes ?? ""}
            onRepNotesChange={setRepNotes}
            coachingPromptCount={session?.coachingPrompts.length ?? 0}
            onEndSession={handleEndSession}
            closingFocus={showCommandBar}
          />
        )}
        <CommandModeBar
          visible={showCommandBar}
          message="Room is warm — reinforce value or move to setup."
          onReinforceValue={handleReinforceValue}
          onOpenAccount={handleOpenAccount}
        />
      </div>
    </SessionStageShell>
  );
}
