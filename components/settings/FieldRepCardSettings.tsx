"use client";

import { useSessionStore } from "@/store/session-store";

export function FieldRepCardSettings() {
  const fieldRepCard = useSessionStore((s) => s.fieldRepCard);
  const setFieldRepCard = useSessionStore((s) => s.setFieldRepCard);

  return (
    <div className="mt-10 space-y-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Field rep card</h2>
        <p className="mt-1 text-xs text-muted">Shown on the Business Health Report footer (share + SMS).</p>
      </div>
      <label className="block text-[10px] font-bold uppercase tracking-wide text-muted">
        Display name
        <input
          className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm text-foreground"
          value={fieldRepCard.displayName}
          onChange={(e) => setFieldRepCard({ ...fieldRepCard, displayName: e.target.value })}
        />
      </label>
      <label className="block text-[10px] font-bold uppercase tracking-wide text-muted">
        Organization
        <input
          className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm text-foreground"
          value={fieldRepCard.org}
          onChange={(e) => setFieldRepCard({ ...fieldRepCard, org: e.target.value })}
        />
      </label>
      <label className="block text-[10px] font-bold uppercase tracking-wide text-muted">
        Phone
        <input
          className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm text-foreground"
          value={fieldRepCard.phone}
          onChange={(e) => setFieldRepCard({ ...fieldRepCard, phone: e.target.value })}
          inputMode="tel"
        />
      </label>
      <label className="block text-[10px] font-bold uppercase tracking-wide text-muted">
        Email
        <input
          className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm text-foreground"
          value={fieldRepCard.email}
          onChange={(e) => setFieldRepCard({ ...fieldRepCard, email: e.target.value })}
          type="email"
        />
      </label>
    </div>
  );
}
