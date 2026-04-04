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
import { VisitMemoryPanel } from "@/components/field/VisitMemoryPanel";
import type { PlacesApplyMeta } from "@/lib/data/businessLookup/placesMeta";
import { fetchNeighborhoodComparison } from "@/lib/data/neighborhoodPlaces";
import { diagnoseGaps, mapPlacesPrimaryType } from "@/lib/field/gapDiagnosis";
import { generatePainDrivenPreCall } from "@/lib/pre-call/painDrivenIntel";

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
  const setGapDiagnosis = useSessionStore((s) => s.setGapDiagnosis);
  const setNeighborhoodComparison = useSessionStore((s) => s.setNeighborhoodComparison);
  const setScoutGeo = useSessionStore((s) => s.setScoutGeo);
  const setPlacesPrimaryType = useSessionStore((s) => s.setPlacesPrimaryType);
  const setPainBriefExtras = useSessionStore((s) => s.setPainBriefExtras);
  const clearScoutDerivedFields = useSessionStore((s) => s.clearScoutDerivedFields);
  const setLiveDemoBuyerStarted = useSessionStore((s) => s.setLiveDemoBuyerStarted);

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
    async (next: BusinessProfile, meta?: PlacesApplyMeta) => {
      const constraintRows = constraintsFromMap(constraintMap);
      const labels = buildCapturedConstraintLabels(fieldSnapshot, constraintRows);
      setForm(next);
      setBusiness({
        ...next,
        capturedConstraintLabels: labels.length ? labels : undefined,
        notes: undefined,
      });
      setDirectoryAutofillAt(Date.now());

      const primaryType = meta?.primaryType ?? null;
      setPlacesPrimaryType(primaryType);
      const lat = meta?.latitude;
      const lng = meta?.longitude;
      if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
        setScoutGeo({ lat, lng });
        const categoryLabel = next.type?.trim() || mapPlacesPrimaryType(primaryType ?? undefined);
        const n = await fetchNeighborhoodComparison({
          categoryLabel,
          lat,
          lng,
          excludeBusinessName: next.name,
        });
        setNeighborhoodComparison(n);
      } else {
        setScoutGeo(null);
        setNeighborhoodComparison(null);
      }

      const gaps = diagnoseGaps(next, primaryType ?? undefined);
      setGapDiagnosis(gaps);
    },
    [
      constraintMap,
      fieldSnapshot,
      setBusiness,
      setDirectoryAutofillAt,
      setGapDiagnosis,
      setNeighborhoodComparison,
      setPlacesPrimaryType,
      setScoutGeo,
    ]
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
      const gaps =
        session?.gapDiagnosis ?? diagnoseGaps(payload, session?.placesPrimaryType ?? undefined);
      if (!session?.gapDiagnosis) setGapDiagnosis(gaps);
      const neighborhood = session?.neighborhoodComparison ?? null;
      const { intel: normalized, extras } = generatePainDrivenPreCall(payload, gaps, neighborhood);
      setPainBriefExtras(extras);
      setIntel(normalized);
      setPreCallIntel(normalized, "deterministic");
      persistConstraintsToStore(fieldSnapshot, constraintMap, payload);
    } catch {
      setError("Could not build the pain-driven brief. Check inputs and try again.");
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
    setLiveDemoBuyerStarted(false);
    setPhase("live-demo");
    router.push(`/session/${params.sessionId}/demo`);
  }

  function handleRescan() {
    setIntel(null);
    setForm(emptyScoutProfile());
    setFieldSnapshotLocal([]);
    setConstraintMap(new Map());
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
      <div className="w-full space-y-10 sm:space-y-14">
        <ScoutStageHeader
          kicker="1 · Scout"
          title="Scan the business. Lock the brief."
          description="Pull the real profile from search, tighten constraints, generate a walk-in brief — then run a Proof Run with the owner. Built for phone-in-hand, not desk work."
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
            painExtras={session?.painBriefExtras ?? null}
            neighborhood={session?.neighborhoodComparison ?? null}
            gapDiagnosis={session?.gapDiagnosis ?? null}
            businessProfile={session?.business ?? null}
            onContinue={goToDemo}
            onNewScout={handleRescan}
          />
        )}
      </div>
    </SessionStageShell>
  );
}
