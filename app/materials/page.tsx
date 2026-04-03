"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { AppShellV2 } from "@/components/layout/AppShellV2";
import { cn } from "@/lib/utils/cn";
import { compileMaterialSet } from "@/lib/materials/compileMaterialSet";
import { useMaterialsStore } from "@/store/materials-store";
import { useSessionStore } from "@/store/session-store";

export default function MaterialsPage() {
  const sets = useMaterialsStore((s) => s.sets);
  const selectedSetId = useMaterialsStore((s) => s.selectedSetId);
  const selectSet = useMaterialsStore((s) => s.selectSet);
  const createSet = useMaterialsStore((s) => s.createSet);
  const deleteSet = useMaterialsStore((s) => s.deleteSet);
  const renameSet = useMaterialsStore((s) => s.renameSet);
  const updateBlocks = useMaterialsStore((s) => s.updateBlocks);
  const setSummary = useMaterialsStore((s) => s.setSummary);

  const applyPresentationMaterial = useSessionStore((s) => s.applyPresentationMaterial);
  const session = useSessionStore((s) => s.session);

  const selected = useMemo(
    () => sets.find((x) => x.id === selectedSetId) ?? null,
    [sets, selectedSetId]
  );

  const [nameDraft, setNameDraft] = useState("");
  const [textDraft, setTextDraft] = useState("");

  // Keep drafts in sync when selection changes.
  useEffect(() => {
    setNameDraft(selected?.name ?? "");
    const firstText = selected?.blocks.find((b) => b.type === "text" && b.value != null);
    setTextDraft(firstText && firstText.type === "text" ? firstText.value : "");
  }, [selected?.id]);

  return (
    <AppShellV2>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-2">
          <Link href="/" className="text-xs font-medium text-accent hover:underline">
            ← Home
          </Link>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Presentation library
              </h1>
              <p className="mt-2 text-sm text-muted">
                Select your ammo before the demo. The live stage presents — it doesn’t manage files.
              </p>
            </div>
            <button
              type="button"
              onClick={() => createSet("New pack")}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" aria-hidden />
              New pack
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-border bg-card p-4 shadow-soft">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              Packs
            </p>
            <div className="space-y-2">
              {sets.map((s) => {
                const active = s.id === selectedSetId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectSet(s.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition",
                      active
                        ? "border-accent/40 bg-accent/5"
                        : "border-border/60 bg-surface/40 hover:border-accent/25"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground">{s.name}</div>
                      <div className="mt-0.5 text-[11px] text-muted">
                        {new Date(s.updatedAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {active && <Check className="h-4 w-4 text-accent" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            {!selected ? (
              <p className="text-sm text-muted">Create a pack to begin.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <label className="mb-1 block text-xs font-medium text-foreground">Pack name</label>
                    <input
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      onBlur={() => renameSet(selected.id, nameDraft.trim() || selected.name)}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      deleteSet(selected.id);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-surface px-4 py-2.5 text-sm font-medium text-muted transition hover:border-signal-red/40 hover:text-signal-red"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Delete
                  </button>
                </div>

                <div className="rounded-2xl border border-border/60 bg-surface/40 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                    Content blocks
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    Text and links for now. Uploads and AI arrangement land later — this is the stable boundary.
                  </p>

                  <label className="mt-4 block text-xs font-medium text-foreground">Core text</label>
                  <textarea
                    value={textDraft}
                    onChange={(e) => setTextDraft(e.target.value)}
                    rows={10}
                    placeholder="Product:\nTarget:\nPain:\nProof:\nPricing:\nCTA:"
                    className="mt-2 w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted">
                      Session:{" "}
                      <span className="font-medium text-foreground">
                        {session ? `active (${session.id.slice(0, 8)})` : "none"}
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const nextBlocks = selected.blocks.map((b) =>
                            b.type === "text" ? { ...b, value: textDraft } : b
                          );
                          updateBlocks(selected.id, nextBlocks);
                        }}
                        className="rounded-xl border border-border/70 bg-card px-4 py-2 text-sm font-medium text-muted transition hover:border-accent/30 hover:text-foreground"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const nextBlocks = selected.blocks.map((b) =>
                            b.type === "text" ? { ...b, value: textDraft } : b
                          );
                          const compiled = compileMaterialSet({ ...selected, blocks: nextBlocks });
                          setSummary(selected.id, compiled);
                          applyPresentationMaterial(compiled);
                        }}
                        className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
                      >
                        Select for session
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-surface/30 p-4">
                  <p className="text-xs font-semibold text-foreground">Preview (compiled)</p>
                  <p className="mt-1 text-xs text-muted">
                    This is what will feed slide generation (deterministic ingestion).
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-border/60 bg-card/60 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted">Product</div>
                      <div className="mt-1 text-sm font-medium text-foreground">
                        {selected.summary?.productName ?? "—"}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-card/60 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted">Target</div>
                      <div className="mt-1 text-sm font-medium text-foreground">
                        {selected.summary?.targetCustomer ?? "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShellV2>
  );
}

