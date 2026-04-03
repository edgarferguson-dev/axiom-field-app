"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { FileUp } from "lucide-react";
import { useLeadStore } from "@/store/lead-store";
import type { LeadImportField, ColumnMapping } from "@/lib/leads/import";
import {
  parseCsvRows,
  guessColumnMapping,
  rowsToObjects,
  mapRowToLeadPartial,
  validateLeadImportRow,
  dedupePartials,
} from "@/lib/leads/import";

const FIELDS: { id: LeadImportField; label: string }[] = [
  { id: "businessName", label: "Business" },
  { id: "contactName", label: "Contact" },
  { id: "phone", label: "Phone" },
  { id: "email", label: "Email" },
  { id: "address", label: "Address" },
  { id: "category", label: "Category" },
  { id: "notes", label: "Notes" },
];

export default function LeadImportPage() {
  const bulkAddLeads = useLeadStore((s) => s.bulkAddLeads);
  const existing = useLeadStore((s) => s.leads);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [status, setStatus] = useState<string | null>(null);

  const loadGrid = useCallback(async (file: File) => {
    setStatus(null);
    const name = file.name.toLowerCase();
    let grid: string[][] = [];

    if (name.endsWith(".csv")) {
      const text = await file.text();
      grid = parseCsvRows(text).filter((r) => r.some((c) => c.trim()));
    } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]!];
      if (!sheet) {
        setStatus("Empty workbook.");
        return;
      }
      const aoa = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" });
      grid = aoa
        .map((r) => (Array.isArray(r) ? r.map((c) => String(c ?? "")) : []))
        .filter((r) => r.some((c) => c.trim()));
    } else {
      setStatus("Use CSV or XLSX.");
      return;
    }

    if (grid.length < 2) {
      setStatus("Need a header row plus data.");
      return;
    }

    const h = grid[0]!.map((c) => c.trim());
    const data = grid.slice(1);
    setHeaders(h);
    setRows(data);
    setMapping(guessColumnMapping(h));
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void loadGrid(f);
  };

  const importRows = () => {
    const objects = rowsToObjects(headers, rows);
    const raw = objects.map((o) => mapRowToLeadPartial(o, mapping));
    const valid = raw.filter((p) => validateLeadImportRow(p).length === 0);
    const deduped = dedupePartials(valid, existing);
    if (deduped.length === 0) {
      setStatus("Nothing new to import (duplicates or missing business names).");
      return;
    }
    bulkAddLeads(deduped);
    setStatus(`Imported ${deduped.length} lead(s).`);
    setHeaders([]);
    setRows([]);
    setMapping({});
  };

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8 md:py-12">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="ax-label mb-1 flex items-center gap-2">
            <FileUp className="h-4 w-4" aria-hidden />
            Import
          </p>
          <h1 className="ax-h1">Lead import</h1>
          <p className="mt-2 max-w-lg text-sm text-muted">Map columns once, validate, dedupe against your list.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/leads/route"
            className="min-h-[44px] rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-accent/30"
          >
            Route
          </Link>
          <Link
            href="/leads"
            className="min-h-[44px] rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-accent/30"
          >
            Leads
          </Link>
        </div>
      </header>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-10 text-center transition hover:border-accent/40">
        <span className="text-sm font-medium text-foreground">Drop or choose CSV / XLSX</span>
        <span className="mt-1 text-xs text-muted">First row = headers</span>
        <input type="file" accept=".csv,.xlsx,.xls" className="sr-only" onChange={onFile} />
      </label>

      {headers.length > 0 && (
        <section className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-semibold text-foreground">Column mapping</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.id}>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted">{f.label}</label>
                <select
                  value={mapping[f.id] ?? ""}
                  onChange={(e) =>
                    setMapping((m) => {
                      const next = { ...m };
                      const v = e.target.value;
                      if (!v) delete next[f.id];
                      else next[f.id] = v;
                      return next;
                    })
                  }
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted">{rows.length} data row(s) · {existing.length} lead(s) on file</p>
          <button
            type="button"
            onClick={importRows}
            disabled={!mapping.businessName}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
          >
            Import validated rows
          </button>
        </section>
      )}

      {status ? <p className="mt-4 text-center text-sm text-muted">{status}</p> : null}
    </div>
  );
}
