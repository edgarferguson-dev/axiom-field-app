"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SessionStageShell } from "@/components/session/SessionStageShell";
import { OfferFitSurface } from "@/components/offer-fit/OfferFitSurface";
import { useSessionStore } from "@/store/session-store";
import { useSessionPhase } from "@/hooks/useSessionPhase";
import { offerFitFromConstraints } from "@/lib/offer-fit/offerFitFromConstraints";

export default function OfferFitPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const setPhase = useSessionStore((s) => s.setPhase);

  useSessionPhase("offer-fit");

  const fit = useMemo(
    () => offerFitFromConstraints(session?.constraints),
    [session?.constraints]
  );

  const handleProceed = useCallback(() => {
    setPhase("closing");
    router.push(`/session/${params.sessionId}/close`);
  }, [setPhase, router, params.sessionId]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SessionStageShell sessionId={params.sessionId}>
      <OfferFitSurface
        businessName={session?.business?.name ?? "This business"}
        constraints={session?.constraints ?? []}
        fit={fit}
        onProceed={handleProceed}
        onBack={handleBack}
      />
    </SessionStageShell>
  );
}
