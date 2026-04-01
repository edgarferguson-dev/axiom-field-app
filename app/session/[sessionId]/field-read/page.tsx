"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SessionShell } from "@/components/layout/session-shell";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";
import type { BusinessProfile, PreCallIntel, RiskBand } from "@/types/session";

// ── Preset options ─────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  "Hair Salon / Barber Shop",
  "HVAC / Plumbing",
  "Dental Office",
  "Auto Repair / Mechanic",
  "Restaurant / Café",
  "Real Estate Agent",
  "Gym / Fitness Studio",
  "Landscaping / Lawn Care",
  "Pest Control",
  "Roofing / Contractor",
  "Insurance Agency",
  "Medical / Clinic",
  "Retail Store",
  "Cleaning Service",
  "Electrician",
  "Chiropractor",
  "Other",
];

const LEAD_SYSTEMS = [
  "No system — phone only",
  "Google My Business",
  "Facebook / Instagram DMs",
  "Word of mouth only",
  "Spreadsheet / notes",
  "Paper & walk-in only",
  "Basic CRM",
  "Other",
];

const LEAD_SOURCES = [
  "Walk-ins",
  "Google / SEO",
  "Facebook Ads",
  "Referrals / word of mouth",
  "Yelp / directory listing",
  "Instagram",
  "Door hangers / flyers",
  "Cold calls",
  "Mixed sources",
  "Other",
];

// ── Risk config ────────────────────────────────────────────────────────────

const RISK_CONFIG: Record<RiskBand, { label: string; color: string; bg: string }> = {
  high: { label: "High Risk", color: "text-signal-red", bg: "bg-signal-red/10 border-signal-red/30" },
  medium: { label: "Medium Risk", color: "text-signal-yellow", bg: "bg-signal-yellow/10 border-signal-yellow/30" },
  low: { label: "Low Risk", color: "text-signal-green", bg: "bg-signal-green/10 border-signal-green/30" },
};

// ── Combobox ───────────────────────────────────────────────────────────────

function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [custom, setCustom] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "Other") {
      setCustom(true);
      onChange("");
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setCustom(false);
      onChange(e.target.value);
    }
  };

  const selectValue = custom ? "Other" : (options.includes(value) ? value : value ? "Other" : "");

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </label>
      <select
        value={selectValue}
        onChange={handleSelect}
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
      >
        <option value="" disabled>{placeholder ?? `Select ${label}`}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {custom && (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}…`}
          className="mt-2 w-full rounded-xl border border-accent/40 bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
        />
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function FieldReadPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!session) return;
    setPhase("field-read");
  }, [session, setPhase]);

  // Auto-trigger AI scan when name + type are both filled
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
      setError("AI scan failed. You can still continue manually.");
    } finally {
      setLoading(false);
    }
  }

  function handleManualScan(e: React.FormEvent) {
    e.preventDefault();
    runScan();
  }

  function handleBeginDemo() {
    setBusiness(form);
    setPhase("live-demo");
    router.push(`/session/${params.sessionId}/demo`);
  }

  function handleSkip() {
    setBusiness(form);
    setPhase("live-demo");
    router.push(`/session/${params.sessionId}/demo`);
  }

  const risk = intel ? RISK_CONFIG[intel.riskBand] : null;
  const canScan = form.name.trim().length >= 1 && form.type.trim().length >= 1;

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
            Select the business type — AI generates your opening intelligence automatically.
          </p>
        </div>

        {/* Input form */}
        {!intel && (
          <form
            onSubmit={handleManualScan}
            className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4"
          >
            {/* Business name — text input */}
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
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

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Business Type"
                options={BUSINESS_TYPES}
                value={form.type}
                onChange={(v) => setForm({ ...form, type: v })}
                placeholder="Select type…"
              />
              <SelectField
                label="Current Lead System"
                options={LEAD_SYSTEMS}
                value={form.currentSystem}
                onChange={(v) => setForm({ ...form, currentSystem: v })}
                placeholder="Select system…"
              />
              <SelectField
                label="Primary Lead Source"
                options={LEAD_SOURCES}
                value={form.leadSource}
                onChange={(v) => setForm({ ...form, leadSource: v })}
                placeholder="Select source…"
              />
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
                  Door Observations
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Busy lobby, no receptionist, overwhelmed staff…"
                  className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                />
              </div>
            </div>

            {/* AI status row */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="flex flex-1 items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
                  <svg className="h-4 w-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm text-accent">Scanning business…</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!canScan || loading}
                  className="flex-1 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-40"
                >
                  Generate Pre-Call Intelligence →
                </button>
              )}
              {canScan && !loading && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="rounded-xl border border-border px-4 py-3 text-sm text-muted transition hover:border-accent/40 hover:text-foreground"
                >
                  Skip
                </button>
              )}
            </div>

            {error && (
              <div className="flex items-center justify-between rounded-xl border border-signal-red/20 bg-signal-red/5 px-4 py-3">
                <p className="text-sm text-signal-red">{error}</p>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="ml-4 text-xs font-medium text-accent underline underline-offset-2"
                >
                  Continue without scan →
                </button>
              </div>
            )}

            {/* Auto-scan hint */}
            {!loading && canScan && !error && (
              <p className="text-center text-xs text-muted">
                AI scan triggers automatically when name and type are filled
              </p>
            )}
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
