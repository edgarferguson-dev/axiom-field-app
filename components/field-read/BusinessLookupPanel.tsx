"use client";

import type { BusinessProfile } from "@/types/session";
import { FormSelect } from "@/components/field-read/FormSelect";

const SCAFFOLD_FIELDS: {
  key: keyof Pick<
    BusinessProfile,
    "website" | "rating" | "reviewCount" | "address" | "social" | "ownerName" | "contactPhone"
  >;
  label: string;
  placeholder: string;
  type?: string;
}[] = [
  { key: "website", label: "Website", placeholder: "https://…" },
  { key: "rating", label: "Rating (e.g. stars)", placeholder: "4.2 / Yelp" },
  { key: "reviewCount", label: "Review count", placeholder: "Approx. count" },
  { key: "address", label: "Address / area", placeholder: "Neighborhood, city" },
  { key: "social", label: "Social", placeholder: "IG / FB handle" },
  { key: "ownerName", label: "Owner / contact", placeholder: "First name if known" },
  { key: "contactPhone", label: "Phone", placeholder: "Main line" },
];

type BusinessLookupPanelProps = {
  form: BusinessProfile;
  onChange: (patch: Partial<BusinessProfile>) => void;
  businessTypes: string[];
};

export function BusinessLookupPanel({ form, onChange, businessTypes }: BusinessLookupPanelProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft ring-1 ring-slate-900/[0.03] sm:p-6">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Account & lookup</p>
        <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          Who are you walking into?
        </h3>
        <p className="mt-1 text-sm text-muted">
          Name and vertical drive the brief. Add what you already know — more context, sharper intel.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
            Business name
          </label>
          <input
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Bella Vista Salon"
            required
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base font-medium text-foreground transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <FormSelect
          label="Business type"
          options={businessTypes}
          value={form.type}
          onChange={(v) => onChange({ type: v })}
          placeholder="Select type…"
        />

        <div className="rounded-xl border border-dashed border-border bg-slate-50/80 p-4">
          <p className="mb-3 text-xs font-medium text-foreground">Profile / lookup (optional)</p>
          <p className="mb-3 text-[11px] leading-relaxed text-muted">
            Drop notes from Maps, Yelp, or last touch. Live enrichment can plug in here later.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {SCAFFOLD_FIELDS.map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted">
                  {label}
                </label>
                <input
                  type={type ?? "text"}
                  value={form[key] ?? ""}
                  onChange={(e) => onChange({ [key]: e.target.value } as Partial<BusinessProfile>)}
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/25"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
