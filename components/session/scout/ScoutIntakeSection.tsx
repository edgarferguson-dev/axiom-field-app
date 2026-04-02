"use client";

import type {
  BusinessProfile,
  ConstraintKey,
  FieldSnapshotKey,
  ConstraintSeverity,
} from "@/types/session";
import {
  ConstraintsCapturePanel,
  defaultConstraintSeverity,
} from "@/components/field-read/ConstraintsCapturePanel";
import { BusinessLookupPanel } from "@/components/field-read/BusinessLookupPanel";
import { FormSelect } from "@/components/field-read/FormSelect";
import { SCOUT_LEAD_SOURCES, SCOUT_LEAD_SYSTEMS } from "@/lib/field/scoutOptions";

type ScoutIntakeSectionProps = {
  form: BusinessProfile;
  onFormChange: (patch: Partial<BusinessProfile>) => void;
  businessTypes: readonly string[];
  fieldSnapshot: FieldSnapshotKey[];
  onToggleField: (key: FieldSnapshotKey) => void;
  constraintMap: Map<ConstraintKey, ConstraintSeverity>;
  onToggleConstraint: (key: ConstraintKey) => void;
  onCycleConstraintSeverity: (key: ConstraintKey, e: React.SyntheticEvent) => void;
  canScan: boolean;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onSkipToDemo: () => void;
  onContinueWithoutBrief: () => void;
};

export function ScoutIntakeSection({
  form,
  onFormChange,
  businessTypes,
  fieldSnapshot,
  onToggleField,
  constraintMap,
  onToggleConstraint,
  onCycleConstraintSeverity,
  canScan,
  loading,
  error,
  onSubmit,
  onSkipToDemo,
  onContinueWithoutBrief,
}: ScoutIntakeSectionProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <BusinessLookupPanel
        form={form}
        onChange={onFormChange}
        businessTypes={[...businessTypes]}
      />

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Lead flow</p>
        <p className="mb-4 text-sm text-muted">
          How leads get in today — feeds the brief and demo story.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect
            label="Current lead system"
            options={[...SCOUT_LEAD_SYSTEMS]}
            value={form.currentSystem}
            onChange={(v) => onFormChange({ currentSystem: v })}
            placeholder="Select system…"
          />
          <FormSelect
            label="Primary lead source"
            options={[...SCOUT_LEAD_SOURCES]}
            value={form.leadSource}
            onChange={(v) => onFormChange({ leadSource: v })}
            placeholder="Select source…"
          />
        </div>
      </section>

      <ConstraintsCapturePanel
        fieldSnapshot={fieldSnapshot}
        onToggleField={onToggleField}
        constraintMap={constraintMap}
        onToggleConstraint={onToggleConstraint}
        onCycleConstraintSeverity={onCycleConstraintSeverity}
      />

      <div className="flex flex-wrap items-center gap-3">
        {loading ? (
          <div className="flex min-w-[200px] flex-1 items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
            <svg className="h-4 w-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm text-accent">Building pre-call brief…</span>
          </div>
        ) : (
          <button
            type="submit"
            disabled={!canScan || loading}
            className="min-w-[200px] flex-1 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-40"
          >
            Lock in brief →
          </button>
        )}
        {canScan && !loading && (
          <button
            type="button"
            onClick={onSkipToDemo}
            className="rounded-xl border border-border px-4 py-3 text-sm text-muted transition hover:border-accent/40 hover:text-foreground"
          >
            Skip to live demo
          </button>
        )}
      </div>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-signal-red/20 bg-signal-red/5 px-4 py-3">
          <p className="text-sm text-signal-red">{error}</p>
          <button
            type="button"
            onClick={onContinueWithoutBrief}
            className="text-xs font-medium text-accent underline underline-offset-2"
          >
            Continue without brief →
          </button>
        </div>
      )}

      {!loading && canScan && !error && (
        <p className="text-center text-xs text-muted">
          Brief generates automatically when name and type are set. Constraints and lookup hints
          sharpen the output.
        </p>
      )}
    </form>
  );
}
