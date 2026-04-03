"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SessionStageShell } from "@/components/session/SessionStageShell";
import { CloseStageSurface } from "@/components/close/CloseStageSurface";
import { useSessionStore } from "@/store/session-store";

const getSessionBusiness = () => useSessionStore.getState().session?.business;
import { useSessionPhase } from "@/hooks/useSessionPhase";
import { buildCloseOutcome } from "@/lib/close/buildCloseOutcome";
import type { CloseOutcomeType } from "@/types/session";

export default function ClosePage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const setCloseOutcome = useSessionStore((s) => s.setCloseOutcome);
  const markCompleted = useSessionStore((s) => s.markCompleted);
  const setPhase = useSessionStore((s) => s.setPhase);

  const [selected, setSelected] = useState<CloseOutcomeType | null>(null);
  const [packageSelected, setPackageSelected] = useState("");
  const [proposalRecipient, setProposalRecipient] = useState("");
  const [decisionMakerName, setDecisionMakerName] = useState("");
  const [followUpReason, setFollowUpReason] = useState("");
  const [followUpTiming, setFollowUpTiming] = useState("");
  const [lossReason, setLossReason] = useState("");
  const [notes, setNotes] = useState("");

  useSessionPhase("closing");

  const handleFinalize = useCallback(async () => {
    const outcome = buildCloseOutcome({
      selected,
      packageSelected,
      proposalRecipient,
      decisionMakerName,
      followUpReason,
      followUpTiming,
      lossReason,
      notes,
    });
    if (!outcome) return;

    setCloseOutcome(outcome);
    markCompleted();
    setPhase("disposition");

    const b = getSessionBusiness();
    if (b) {
      void fetch("/api/integrations/crm/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: b.contactEmail,
          phone: b.contactPhone,
          companyName: b.name,
          firstName: b.ownerName?.split(/\s+/)[0],
          lastName: b.ownerName?.split(/\s+/).slice(1).join(" "),
          address: b.address,
          website: b.website,
          category: b.type,
          note: notes.trim() || undefined,
        }),
      }).catch(() => {});
    }

    router.push(`/session/${params.sessionId}/disposition`);
  }, [
    selected,
    packageSelected,
    proposalRecipient,
    decisionMakerName,
    followUpReason,
    followUpTiming,
    lossReason,
    notes,
    setCloseOutcome,
    markCompleted,
    setPhase,
    router,
    params.sessionId,
  ]);

  return (
    <SessionStageShell sessionId={params.sessionId}>
      <CloseStageSurface
        businessName={session?.business?.name ?? "This business"}
        selected={selected}
        onSelectOutcome={setSelected}
        packageSelected={packageSelected}
        onPackageSelected={setPackageSelected}
        proposalRecipient={proposalRecipient}
        onProposalRecipientChange={setProposalRecipient}
        decisionMakerName={decisionMakerName}
        onDecisionMakerNameChange={setDecisionMakerName}
        followUpReason={followUpReason}
        onFollowUpReasonChange={setFollowUpReason}
        followUpTiming={followUpTiming}
        onFollowUpTimingChange={setFollowUpTiming}
        lossReason={lossReason}
        onLossReasonChange={setLossReason}
        notes={notes}
        onNotesChange={setNotes}
        canFinalize={!!selected}
        onFinalize={handleFinalize}
      />
    </SessionStageShell>
  );
}
