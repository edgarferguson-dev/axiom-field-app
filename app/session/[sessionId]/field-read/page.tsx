"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { FormEvent, SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { SessionStageShell } from "@/components/session/SessionStageShell";
import { ScoutStageHeader } from "@/components/session/scout/ScoutStageHeader";
import { ScoutIntakeSection } from "@/components/session/scout/ScoutIntakeSection";
import { ScoutBriefSection } from "@/components/session/scout/ScoutBriefSection";
import { useSessionStore } from "@/store/session-store";
import type {
  BusinessProfile,
  PreCallIntel,
  ConstraintKey,
  FieldSnapshotKey,
  ConstraintSeverity,
} from "@/types/session";
import { computeEngagementDecision } from "@/lib/decisionEngine";
import { defaultConstraintSeverity } from "@/components/field-read/ConstraintsCapturePanel";
import { buildCapturedConstraintLabels } from "@/lib/field/constraintsCapture";
import { SCOUT_BUSINESS_TYPES } from "@/lib/field/scoutOptions";
import { constraintsFromMap, emptyScoutProfile } from "@/lib/field/scoutForm";
import { normalizePreCallIntel } from "@/lib/pre-call/normalizer";
import type { PreCallSource } from "@/types/pre-call";
import { VisitMemoryPanel } from "@/components/field/VisitMemoryPanel";

export default function FieldReadPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const preCallIntelSource = useSessionStore((s) => s.session?.preCallIntelSource ?? null);
  const setBusiness = useSessionStore((s) => s.setBusiness);
  const setDirectoryAutofillAt = useSessionStore((s) => s.setDirectoryAutofillAt);
  const directoryAutofillAt = useSessionStore((s) => s.session?.directoryAutofillAt ?? null);
  const setPreCallIntel = useSessionStore((s) => s.setPreCallIntel);
  const setPhase = useSessionStore((s) => s.setPhase);
  const setConstraints = useSessionStore((s) => s.setConstraints);
  const setFieldSnapshot = useSessionStore((s) => s.setFieldSnapshot);
  const setFieldEngagementDecision = useSessionStore((s) => s.setFieldEngagementDecision);
  const setCloseState = useSessionStore((s) => s.setCloseState);
  const setCloseCTAs = useSessionStore((s) => s.setCloseCTAs);
  const setObjectionTriggered = useSessionStore((s) => s.setObjectionTriggered);
  const initializeProofState = useSessionStore((s) => s.initializeProofState);
  const resetProofState = useSessionStore((s) => s.resetProofState);

  const [form, setForm] = useState<BusinessProfile>(emptyScoutProfile);
  const [fieldSnapshot, setFieldSnapshotLocal] = useState<FieldSnapshotKey[]>([]);
  const [constraintMap, setConstraintMap] = useState<Map<ConstraintKey, ConstraintSeverity>>(
    () => new Map()
  );
  const [intel, setIntel] = useState<PreCallIntel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistConstraintsToStore = useCallback(
    (fs: FieldSnapshotKey[], cmap: Map<ConstraintKey, ConstraintSeverity>, profile: BusinessProfile) => {
      const constraintRows = constraintsFromMap(cmap);
      const labels = buildCapturedConstraintLabels(fs, constraintRows);
      setFieldSnapshot(fs);
      setConstraints(constraintRows);
      setBusiness({
        ...profile,
        capturedConstraintLabels: labels.length ? labels : undefined,
        notes: undefined,
      });
    },
    [setBusiness, setConstraints, setFieldSnapshot]
  );

  /** RFC 6 — merge directory/places into form + session; rep edits after this stay authoritative. */
  const handleDirectoryApply = useCallback(
    (next: BusinessProfile) => {
      const constraintRows = constraintsFromMap(constraintMap);
      const labels = buildCapturedConstraintLabels(fieldSnapshot, constraintRows);
      setForm(next);
      setBusiness({
        ...next,
        capturedConstraintLabels: labels.length ? labels : undefined,
        notes: undefined,
      });
      setDirectoryAutofillAt(Date.now());
    },
    [constraintMap, fieldSnapshot, setBusiness, setDirectoryAutofillAt]
  );

  useEffect(() => {
    if (!session) return;
    setPhase("field-read");
  }, [session?.id, setPhase]);

  useEffect(() => {
    if (!session) return;
    if (session.business) {
      setForm({
        name: session.business.name,
        type: session.business.type,
        currentSystem: session.business.currentSystem,
        leadSource: session.business.leadSource,
        notes: session.business.notes,
        capturedConstraintLabels: session.business.capturedConstraintLabels,
        directoryPlaceId: session.business.directoryPlaceId,
        website: session.business.website,
        rating: session.business.rating,
        reviewCount: session.business.reviewCount,
        address: session.business.address,
        social: session.business.social,
        ownerName: session.business.ownerName,
        contactPhone: session.business.contactPhone,
        contactEmail: session.business.contactEmail,
      });
    }
    if (session.fieldSnapshot?.length) {
      setFieldSnapshotLocal([...session.fieldSnapshot]);
    }
    if (session.constraints?.length) {
      const m = new Map<ConstraintKey, ConstraintSeverity>();
      session.constraints.forEach((c) => m.set(c.key, c.severity));
      setConstraintMap(m);
    }
  }, [session?.id]);

  useEffect(() => {
    if (!session?.preCallIntel) {
      setIntel(null);
      return;
    }
    setIntel(normalizePreCallIntel(session.preCallIntel));
  }, [session?.id, session?.preCallIntel]);

  const canScan = form.name.trim().length >= 1 && form.type.trim().length >= 1;

  const engagementGate = useMemo(() => {
    if (!canScan) return null;
    const rows = constraintsFromMap(constraintMap);
    return computeEngagementDecision(rows, form.type);
  }, [canScan, constraintMap, form.type]);

  useEffect(() => {
    if (!session) return;
    if (!canScan) {
      setFieldEngagementDecision(null);
      return;
    }
    if (engagementGate) setFieldEngagementDecision(engagementGate);
  }, [session?.id, canScan, engagementGate, setFieldEngagementDecision]);

  async function runScan() {
    const gate = engagementGate ?? computeEngagementDecision(constraintsFromMap(constraintMap), form.type);
    if (!gate || gate.decision === "WALK") return;

    setLoading(true);
    setError(null);
    const constraintRows = constraintsFromMap(constraintMap);
    const labels = buildCapturedConstraintLabels(fieldSnapshot, constraintRows);
    const payload: BusinessProfile = {
      ...form,
      capturedConstraintLabels: labels.length ? labels : undefined,
    };
    try {
      const res = await fetch("/api/pre-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send constraints + fieldSnapshot so the server can run a context-aware
        // fallback if the AI call fails — the route always returns 200 + valid intel.
        body: JSON.stringify({
          ...payload,
          fieldEngagementDecision: gate,
          constraints: constraintRows,
          fieldSnapshot,
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = (await res.json()) as PreCallIntel & { source?: PreCallSource };
      const { source: briefSource, ...rest } = data;
      const normalized = normalizePreCallIntel(rest);
      if (!normalized) throw new Error("Unusable response shape");
      setIntel(normalized);
      setPreCallIntel(
        normalized,
        briefSource === "ai" || briefSource === "deterministic" ? briefSource : null
      );
      persistConstraintsToStore(fieldSnapshot, constraintMap, payload);
    } catch {
      // Only reached on network failure or a true 5xx — the route handles AI
      // failures internally by returning deterministic fallback intel.
      setError("Could not reach the server. You can still continue manually.");
    } finally {
      setLoading(false);
    }
  }

  function handleManualScan(e: FormEvent) {
    e.preventDefault();
    runScan();
  }

  function goToDemo() {
    const constraintRows = constraintsFromMap(constraintMap);
    const labels = buildCapturedConstraintLabels(fieldSnapshot, constraintRows);
    const profile: BusinessProfile = {
      ...form,
      capturedConstraintLabels: labels.length ? labels : undefined,
    };
    persistConstraintsToStore(fieldSnapshot, constraintMap, profile);
    initializeProofState();
    setPhase("live-demo");
    router.push(`/session/${params.sessionId}/demo`);
  }

  function handleRescan() {
    setIntel(null);
    setForm(emptyScoutProfile());
    setFieldSnapshotLocal([]);
    setConstraintMap(new Map());
    setPreCallIntel(null, null);
    setDirectoryAutofillAt(null);
    setFieldEngagementDecision(null);
    setCloseState(null);
    setCloseCTAs(null, null);
    setObjectionTriggered(false);
    setConstraints([]);
    setFieldSnapshot([]);
    setBusiness(emptyScoutProfile());
    resetProofState();
  }

  function toggleField(key: FieldSnapshotKey) {
    setFieldSnapshotLocal((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function toggleConstraint(key: ConstraintKey) {
    setConstraintMap((prev) => {
      const next = new Map(prev);
      if (next.has(key)) next.delete(key);
      else next.set(key, defaultConstraintSeverity());
      return next;
    });
  }

  function cycleSeverity(key: ConstraintKey, e: SyntheticEvent) {
    e.stopPropagation();
    setConstraintMap((prev) => {
      const next = new Map(prev);
      const cur = next.get(key);
      if (!cur) return next;
      const order: ConstraintSeverity[] = ["high", "medium", "low"];
      const idx = order.indexOf(cur);
      next.set(key, order[(idx + 1) % order.length]);
      return next;
    });
  }

  return (
    <SessionStageShell sessionId={params.sessionId}>
      <div className="w-full space-y-16">
        <ScoutStageHeader
          kicker="Phase 1 · Pre-call intelligence"
          title="Scout the account, capture constraints, get your brief"
          description="Built for the parking lot and the lobby: lookup hints, field pressure, operational constraints — then a tight AI brief with opener, objection prep, and tablet timing before you walk in."
        />

        <VisitMemoryPanel businessProfileHint={form} />

        {!intel && (
          <ScoutIntakeSection
            form={form}
            onFormChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
            businessTypes={SCOUT_BUSINESS_TYPES}
            fieldSnapshot={fieldSnapshot}
            onToggleField={toggleField}
            constraintMap={constraintMap}
            onToggleConstraint={toggleConstraint}
            onCycleConstraintSeverity={cycleSeverity}
            canScan={canScan}
            loading={loading}
            error={error}
            onSubmit={handleManualScan}
            onSkipToDemo={goToDemo}
            onContinueWithoutBrief={goToDemo}
            engagementGate={engagementGate}
            canShowEngagementGate={canScan}
            onDirectoryApply={handleDirectoryApply}
            directoryAutofillAt={directoryAutofillAt}
          />
        )}

        {intel && (
          <ScoutBriefSection
            intel={intel}
            briefSource={preCallIntelSource}
            onContinue={goToDemo}
            onNewScout={handleRescan}
          />
        )}
      </div>
    </SessionStageShell>
  );
}
