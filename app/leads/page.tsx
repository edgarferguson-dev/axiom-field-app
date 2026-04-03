"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { seedDemoLeadsIfEmpty, useLeadStore } from "@/store/lead-store";
import type { LeadStatus } from "@/types/lead";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  visited: "Visited",
  follow_up: "Follow-up",
  won: "Won",
  lost: "Lost",
  not_qualified: "Not qualified",
};

export default function LeadsPage() {
  const leads = useLeadStore((s) => s.leads);

  useEffect(() => {
    seedDemoLeadsIfEmpty();
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 md:py-12">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="ax-label mb-1 flex items-center gap-2">
            <Users className="h-4 w-4" aria-hidden />
            Leads
          </p>
          <h1 className="ax-h1">Leads</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">Directory — open a row, start visit. Not a CRM.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/leads/import"
            className="min-h-[44px] rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-accent/30"
          >
            Import
          </Link>
          <Link
            href="/leads/route"
            className="min-h-[44px] rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-accent/30"
          >
            Route
          </Link>
          <Link
            href="/"
            className="min-h-[44px] rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-accent/30"
          >
            Home
          </Link>
        </div>
      </header>

      {leads.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center text-sm text-muted">No leads yet.</p>
      ) : (
        <ul className="space-y-2">
          {leads.map((l) => (
            <li key={l.id}>
              <Link
                href={`/leads/${l.id}`}
                className="flex min-h-[56px] flex-col justify-center rounded-xl border border-border bg-card px-4 py-3 shadow-soft transition hover:border-accent/25"
              >
                <span className="font-semibold text-foreground">{l.businessName || "Untitled"}</span>
                <span className="mt-0.5 text-sm text-muted">
                  {l.contactName}
                  {l.nextAction ? ` · ${l.nextAction}` : ""}
                </span>
                <span className="mt-1 text-xs font-medium uppercase tracking-wide text-accent">{STATUS_LABEL[l.status]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
