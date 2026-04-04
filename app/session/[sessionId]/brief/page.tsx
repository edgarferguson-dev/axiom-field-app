"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionStageShell } from "@/components/session/SessionStageShell";
import { ScoutBriefSection } from "@/components/session/scout/ScoutBriefSection";
import { useSessionStore } from "@/store/session-store";
import type { PreCallIntel } from "@/types/session";
import { normalizePreCallIntel } from "@/lib/pre-call/normalizer";
import { emptyScoutProfile } from "@/lib/field/scoutForm";
import { NEIGHBORHOOD_CONTEXT_IDLE } from "@/types/scoutIntel";
import { DEFAULT_OPENING_MODE } from "@/types/presentationPack";
import Link from "next/link";

/**
 * Brief-only route — canonical “Brief” tab target (Scout stays on field-read).
 */
export default function BriefPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const preCallIntelSource = useSessionStore((s) => s.session?.preCallIntelSource ?? null);
  const setPreCallIntel = useSessionStore((s) => s.setPreCallIntel);
  const setPainBriefExtras = useSessionStore((s) => s.setPainBriefExtras);
  const clearScoutDerivedFields = useSessionStore((s) => s.clearScoutDerivedFields);
  const setDirectoryAutofillAt = useSessionStore((s) => s.setDirectoryAutofillAt);
  const setFieldEngagementDecision = useSessionStore((s) => s.setFieldEngagementDecision);
  const setCloseState = useSessionStore((s) => s.setCloseState);
  const setCloseCTAs = useSessionStore((s) => s.setCloseCTAs);
  const setObjectionTriggered = useSessionStore((s) => s.setObjectionTriggered);
  const setConstraints = useSessionStore((s) => s.setConstraints);
  const setFieldSnapshot = useSessionStore((s) => s.setFieldSnapshot);
  const setBusiness = useSessionStore((s) => s.setBusiness);
  const resetProofState = useSessionStore((s) => s.resetProofState);
  const initializeProofState = useSessionStore((s) => s.initializeProofState);
  const setPhase = useSessionStore((s) => s.setPhase);
  const setLiveDemoBuyerStarted = useSessionStore((s) => s.setLiveDemoBuyerStarted);

  const [intel, setIntel] = useState<PreCallIntel | null>(null);

  useEffect(() => {
    if (!session?.preCallIntel) {
      setIntel(null);
      return;
    }
    setIntel(normalizePreCallIntel(session.preCallIntel));
  }, [session?.id, session?.preCallIntel]);

  function goToDemo() {
    initializeProofState();
    setLiveDemoBuyerStarted(false);
    setPhase("live-demo");
    router.push(`/session/${params.sessionId}/demo`);
  }

  function handleRescan() {
    setIntel(null);
    setPreCallIntel(null, null);
    setPainBriefExtras(null);
    clearScoutDerivedFields();
    setDirectoryAutofillAt(null);
    setFieldEngagementDecision(null);
    setCloseState(null);
    setCloseCTAs(null, null);
    setObjectionTriggered(false);
    setConstraints([]);
    setFieldSnapshot([]);
    setBusiness(emptyScoutProfile());
    resetProofState();
    router.push(`/session/${params.sessionId}/field-read?mode=scout`);
  }

  return (
    <SessionStageShell sessionId={params.sessionId}>
      <div className="w-full space-y-8 sm:space-y-10">
        {intel ? (
          <ScoutBriefSection
            intel={intel}
            briefSource={preCallIntelSource}
            painExtras={session?.painBriefExtras ?? null}
            neighborhoodContext={session?.neighborhoodContext ?? NEIGHBORHOOD_CONTEXT_IDLE}
            gapDiagnosis={session?.gapDiagnosis ?? null}
            businessProfile={session?.business ?? null}
            openingMode={session?.presentation?.openingMode ?? DEFAULT_OPENING_MODE}
            onContinue={goToDemo}
            onNewScout={handleRescan}
          />
        ) : (
          <div className="mx-auto max-w-xl rounded-2xl border border-ink-border bg-ink-900 px-5 py-8 text-center text-white shadow-[0_12px_40px_rgb(0_0_0/0.2)] sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/90">Brief</p>
            <h1 className="mt-3 text-lg font-bold text-white sm:text-xl">No brief yet</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Lock scout + brief on Field Read — then this tab becomes your tactical sheet for the room.
            </p>
            <Link
              href={`/session/${params.sessionId}/field-read?mode=scout`}
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-600 px-6 text-sm font-bold text-white no-underline transition hover:bg-teal-500"
            >
              Go to Scout
            </Link>
          </div>
        )}
      </div>
    </SessionStageShell>
  );
}
