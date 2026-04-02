"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { defaultConstraintSeverity } from "@/components/field-read/ConstraintsCapturePanel";
import { buildCapturedConstraintLabels } from "@/lib/field/constraintsCapture";
import { SCOUT_BUSINESS_TYPES } from "@/lib/field/scoutOptions";
import { constraintsFromMap, emptyScoutProfile } from "@/lib/field/scoutForm";
import { normalizePreCallIntel } from "@/lib/utils/preCallIntel";

export default function FieldReadPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const setBusiness = useSessionStore((s) => s.setBusiness);
  const setPreCallIntel = useSessionStore((s) => s.setPreCallIntel);
  const setPhase = useSessionStore((s) => s.setPhase);
  const setConstraints = useSessionStore((s) => s.setConstraints);
  const setFieldSnapshot = useSessionStore((s) => s.setFieldSnapshot);

  const [form, setForm] = useState<BusinessProfile>(emptyScoutProfile);
  const [fieldSnapshot, setFieldSnapshotLocal] = useState<FieldSnapshotKey[]>([]);
  const [constraintMap, setConstraintMap] = useState<Map<ConstraintKey, ConstraintSeverity>>(
    () => new Map()
  );
  const [intel, setIntel] = useState<PreCallIntel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        website: session.business.website,
        rating: session.business.rating,
        reviewCount: session.business.reviewCount,
        address: session.business.address,
        social: session.business.social,
        ownerName: session.business.ownerName,
        contactPhone: session.business.contactPhone,
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

  useEffect(() => {
    if (!form.name.trim() || !form.type.trim() || intel || loading) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runScan();
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name, form.type]);

  async function runScan() {
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
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("API error");
      const data = (await res.json()) as Partial<PreCallIntel>;
      const normalized = normalizePreCallIntel(data);
      if (!normalized) throw new Error("Invalid response");
      setIntel(normalized);
      setPreCallIntel(normalized);
      persistConstraintsToStore(fieldSnapshot, constraintMap, payload);
    } catch {
      setError("AI scan failed. You can still continue manually.");
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
    setPhase("live-demo");
    router.push(`/session/${params.sessionId}/demo`);
  }

  function handleRescan() {
    setIntel(null);
    setForm(emptyScoutProfile());
    setFieldSnapshotLocal([]);
    setConstraintMap(new Map());
    setPreCallIntel(null);
    setConstraints([]);
    setFieldSnapshot([]);
    setBusiness(emptyScoutProfile());
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

  const canScan = form.name.trim().length >= 1 && form.type.trim().length >= 1;

  return (
    <SessionStageShell sessionId={params.sessionId}>
      <div className="mx-auto max-w-4xl space-y-6">
        <ScoutStageHeader
          kicker="Phase 1 · Pre-call intelligence"
          title="Scout the account, capture constraints, get your brief"
          description="Built for the parking lot and the lobby: lookup hints, field pressure, operational constraints — then a tight AI brief with opener, objection prep, and tablet timing before you walk in."
        />

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
          />
        )}

        {intel && (
          <ScoutBriefSection intel={intel} onContinue={goToDemo} onNewScout={handleRescan} />
        )}
      </div>
    </SessionStageShell>
  );
}
