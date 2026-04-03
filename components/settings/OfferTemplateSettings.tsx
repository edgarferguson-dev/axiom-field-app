"use client";

import { useCallback } from "react";
import { useSessionStore } from "@/store/session-store";
import type { OfferTemplate } from "@/types/offerTemplate";
import { DEFAULT_OFFER_TEMPLATE_ID } from "@/types/offerTemplate";

function parseBullets(raw: string): string[] {
  return raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 8);
}

/**
 * Phase 7D — minimal template editor (local persistence only).
 */
export function OfferTemplateSettings() {
  const offerTemplates = useSessionStore((s) => s.offerTemplates);
  const defaultOfferTemplateId = useSessionStore((s) => s.defaultOfferTemplateId);
  const setOfferTemplates = useSessionStore((s) => s.setOfferTemplates);
  const setDefaultOfferTemplateId = useSessionStore((s) => s.setDefaultOfferTemplateId);

  const updateTemplate = useCallback(
    (id: string, patch: Partial<OfferTemplate>) => {
      const next = offerTemplates.map((t) => (t.id === id ? { ...t, ...patch } : t));
      setOfferTemplates(next);
    },
    [offerTemplates, setOfferTemplates]
  );

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Offer templates</h2>
        <p className="mt-1 text-xs text-muted">
          In-room ask uses one active template per run (pick on demo private). Default applies when no run override.
        </p>
      </div>

      <div className="space-y-4">
        {offerTemplates.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-border bg-card p-3 shadow-soft ring-1 ring-foreground/[0.04]"
          >
            <label className="flex cursor-pointer items-center gap-2 border-b border-border/40 pb-2">
              <input
                type="radio"
                name="default-offer"
                checked={defaultOfferTemplateId === t.id}
                onChange={() => setDefaultOfferTemplateId(t.id)}
                className="h-4 w-4 accent-accent"
              />
              <span className="text-xs font-semibold text-foreground">Default workspace offer</span>
            </label>

            <label className="mt-3 block text-[10px] font-bold uppercase tracking-wide text-muted">
              Label
              <input
                className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm text-foreground"
                value={t.label}
                onChange={(e) => updateTemplate(t.id, { label: e.target.value })}
              />
            </label>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="block text-[10px] font-bold uppercase tracking-wide text-muted">
                Monthly ($)
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm text-foreground"
                  value={t.monthlyFee}
                  onChange={(e) => updateTemplate(t.id, { monthlyFee: Number(e.target.value) || 0 })}
                />
              </label>
              <label className="block text-[10px] font-bold uppercase tracking-wide text-muted">
                Setup ($)
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm text-foreground"
                  value={t.setupFee}
                  onChange={(e) => updateTemplate(t.id, { setupFee: Number(e.target.value) || 0 })}
                />
              </label>
            </div>

            <label className="mt-2 block text-[10px] font-bold uppercase tracking-wide text-muted">
              Included (one per line)
              <textarea
                className="mt-1 min-h-[6rem] w-full rounded-lg border border-border bg-surface px-2 py-2 text-xs text-foreground"
                value={t.includedBullets.join("\n")}
                onChange={(e) => updateTemplate(t.id, { includedBullets: parseBullets(e.target.value) })}
              />
            </label>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted">
        IDs are fixed ({DEFAULT_OFFER_TEMPLATE_ID} = default starting point). Editing prices updates the next regenerated deck.
      </p>
    </div>
  );
}
