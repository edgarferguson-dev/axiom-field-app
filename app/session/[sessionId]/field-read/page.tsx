"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SessionShell } from "@/components/layout/session-shell";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";
import type { BusinessProfile, PreCallIntel, RiskBand } from "@/types/session";

const RISK_CONFIG: Record<RiskBand, { label: string; color: string; bg: string }> = {
  high: { label: "High Risk", color: "text-signal-red", bg: "bg-signal-red/10 border-signal-red/30" },
  medium: { label: "Medium Risk", color: "text-signal-yellow", bg: "bg-signal-yellow/10 border-signal-yellow/30" },
  low: { label: "Low Risk", color: "text-signal-green", bg: "bg-signal-green/10 border-signal-green/30" },
};

export default function FieldReadPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const { setBusiness, setPreCallIntel, setPhase } = useSessionStore();

  const [form, setForm] = useState<BusinessProfile>({
    name: "",
    type: "",
    currentSystem: "",
    leadSource: "",
    notes: "",
  });
  const [intel, setIntel] = useState<PreCallIntel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/pre-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("API error");

      const data = (await res.json()) as PreCallIntel;
      setIntel(data);
      setBusiness(form);
      setPreCallIntel(data);
    } catch {
      setError("Unable to generate intelligence. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleBeginDemo() {
    setPhase("live-demo");
    router.push(`/session/${params.sessionId}/demo`);
  }

  const risk = intel ? RISK_CONFIG[intel.riskBand] : null;

  return (
    <SessionShell>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Phase 1 · Pre-Call Intelligence
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Scan the business before you knock.
          </h2>
          <p className="mt-1 text-sm text-muted">
            Enter what you observe at the door. AI generates your opening intelligence.
          </p>
        </div>

        {/* Input form */}
        {!intel && (
          <form
            onSubmit={handleScan}
            className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted uppercase tracking-wider">
                  Business Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Bella Vista Salon"
                  required
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted uppercase tracking-wider">
                  Business Type
                </label>
                <input
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  placeholder="e.g. Hair salon, HVAC, Dentist"
                  required
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted uppercase tracking-wider">
                  Current Lead System
                </label>
                <input
                  value={form.currentSystem}
                  onChange={(e) => setForm({ ...form, currentSystem: e.target.value })}
                  placeholder="e.g. Phone only, no CRM"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted uppercase tracking-wider">
                  Primary Lead Source
                </label>
                <input
                  value={form.leadSource}
                  onChange={(e) => setForm({ ...form, leadSource: e.target.value })}
                  placeholder="e.g. Walk-ins, Google, Referrals"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted uppercase tracking-wider">
                Door Observations
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Busy lobby, staff overwhelmed, no receptionist visible…"
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-signal-red">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-40"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Scanning business…
                </span>
              ) : (
                "Generate Pre-Call Intelligence →"
              )}
            </button>
          </form>
        )}

        {/* Intel output */}
        {intel && risk && (
          <div className="space-y-4 animate-slide-up">
            {/* Risk band + missed value */}
            <div className="flex flex-wrap items-start gap-3">
              <div className={cn("rounded-xl border px-4 py-3 text-sm font-medium", risk.bg, risk.color)}>
                {risk.label} · {intel.missedValueEstimate}
              </div>
              <button
                onClick={() => {
                  setIntel(null);
                  setForm({ name: "", type: "", currentSystem: "", leadSource: "", notes: "" });
                }}
                className="rounded-xl border border-border px-4 py-3 text-sm text-muted transition hover:border-accent hover:text-foreground"
              >
                Re-scan
              </button>
            </div>

            {/* Pain pattern */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Pain Pattern
              </p>
              <p className="text-sm leading-relaxed text-foreground">{intel.painPattern}</p>
            </div>

            {/* Recommended angle */}
            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
                Your Opening Line
              </p>
              <p className="text-sm italic leading-relaxed text-foreground">
                &ldquo;{intel.recommendedAngle}&rdquo;
              </p>
            </div>

            {/* Key opportunities */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Key Talking Points
              </p>
              <ul className="space-y-2">
                {intel.keyOpportunities.map((opp, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                      {i + 1}
                    </span>
                    <span className="text-foreground">{opp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Begin demo CTA */}
            <button
              onClick={handleBeginDemo}
              className="w-full rounded-xl bg-accent px-5 py-4 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
            >
              Begin Live Demo →
            </button>
          </div>
        )}
      </div>
    </SessionShell>
  );
}
