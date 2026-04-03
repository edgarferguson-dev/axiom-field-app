"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { seedDemoLeadsIfEmpty, useLeadStore } from "@/store/lead-store";
import { useSessionStore } from "@/store/session-store";
import type { LeadStatus } from "@/types/lead";
import { cn } from "@/lib/utils/cn";

const STATUSES: LeadStatus[] = ["new", "contacted", "visited", "follow_up", "won", "lost", "not_qualified"];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = typeof params.leadId === "string" ? params.leadId : "";

  const leads = useLeadStore((s) => s.leads);
  const updateLead = useLeadStore((s) => s.updateLead);
  const startSessionFromLead = useSessionStore((s) => s.startSessionFromLead);
  const sessionRep = useSessionStore((s) => s.session?.repName);

  const lead = useMemo(() => leads.find((l) => l.id === leadId), [leads, leadId]);

  const [repName, setRepName] = useState("");

  useEffect(() => {
    seedDemoLeadsIfEmpty();
  }, []);

  useEffect(() => {
    setRepName((r) => r || sessionRep || "");
  }, [sessionRep]);

  const patch = useCallback(
    (field: keyof import("@/types/lead").Lead, value: string) => {
      if (!lead) return;
      updateLead(lead.id, { [field]: value });
    },
    [lead, updateLead]
  );

  const startVisit = useCallback(() => {
    if (!lead) return;
    const name = repName.trim() || "Rep";
    const id = startSessionFromLead(lead, name);
    router.push(`/session/${id}/field-read`);
  }, [lead, repName, startSessionFromLead, router]);

  if (!lead) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-muted">Lead not found.</p>
        <Link href="/leads" className="mt-4 inline-block text-sm font-medium text-accent">
          Back to leads
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/leads" className="text-sm font-medium text-muted hover:text-foreground">
          ← Leads
        </Link>
        <button
          type="button"
          onClick={startVisit}
          className="min-h-[48px] rounded-xl bg-accent px-5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
        >
          Start visit
        </button>
      </div>

      <h1 className="ax-h1 mb-2">{lead.businessName || "Lead"}</h1>
      <p className="mb-8 text-sm text-muted">Field read → demo → disposition. Session is prefilled from this card.</p>

      <div className="mb-6 space-y-2">
        <label className="ax-label block">Rep name (session)</label>
        <input
          value={repName}
          onChange={(e) => setRepName(e.target.value)}
          placeholder="Your name"
          className="w-full min-h-[48px] rounded-xl border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <Field label="Business" value={lead.businessName} onChange={(v) => patch("businessName", v)} />
        <Field label="Contact" value={lead.contactName} onChange={(v) => patch("contactName", v)} />
        <Field label="Phone" value={lead.phone} onChange={(v) => patch("phone", v)} />
        <Field label="Email" value={lead.email} onChange={(v) => patch("email", v)} />
        <Field label="Address" value={lead.address} onChange={(v) => patch("address", v)} />
        <Field label="Category" value={lead.category} onChange={(v) => patch("category", v)} />

        <div>
          <label className="ax-label mb-1 block">Status</label>
          <select
            value={lead.status}
            onChange={(e) => updateLead(lead.id, { status: e.target.value as LeadStatus })}
            className="min-h-[48px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="ax-label mb-1 block">Last contact</label>
          <input
            type="date"
            value={lead.lastContact ?? ""}
            onChange={(e) => updateLead(lead.id, { lastContact: e.target.value || null })}
            className="min-h-[48px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="ax-label mb-1 block">Next action</label>
          <input
            value={lead.nextAction}
            onChange={(e) => patch("nextAction", e.target.value)}
            className="min-h-[48px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="ax-label mb-1 block">Notes</label>
          <textarea
            value={lead.notes}
            onChange={(e) => patch("notes", e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="ax-label mb-1 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("min-h-[48px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm")}
      />
    </div>
  );
}
