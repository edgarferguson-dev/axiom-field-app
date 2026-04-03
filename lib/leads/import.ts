import type { Lead } from "@/types/lead";

export type LeadImportField =
  | "businessName"
  | "contactName"
  | "phone"
  | "email"
  | "address"
  | "category"
  | "notes";

export type ColumnMapping = Partial<Record<LeadImportField, string>>;

const SYNONYMS: Record<LeadImportField, readonly string[]> = {
  businessName: ["business", "company", "account", "business name", "name"],
  contactName: ["contact", "owner", "contact name", "full name"],
  phone: ["phone", "mobile", "tel", "telephone"],
  email: ["email", "e-mail"],
  address: ["address", "street", "location"],
  category: ["category", "type", "industry", "vertical"],
  notes: ["notes", "comments", "description"],
};

/** Split CSV into rows; handles simple quoted fields. */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let i = 0;
  let inQuotes = false;

  const pushCell = () => {
    row.push(cur);
    cur = "";
  };
  const pushRow = () => {
    rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const c = text[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cur += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === ",") {
      pushCell();
      i += 1;
      continue;
    }
    if (c === "\r") {
      i += 1;
      continue;
    }
    if (c === "\n") {
      pushCell();
      pushRow();
      i += 1;
      continue;
    }
    cur += c;
    i += 1;
  }
  if (cur.length > 0 || row.length > 0) {
    pushCell();
    pushRow();
  }
  return rows;
}

function normHeader(h: string) {
  return h.toLowerCase().trim().replace(/\s+/g, " ");
}

export function guessColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const used = new Set<string>();

  for (const field of Object.keys(SYNONYMS) as LeadImportField[]) {
    const syns = SYNONYMS[field];
    for (let idx = 0; idx < headers.length; idx++) {
      const h = normHeader(headers[idx] ?? "");
      if (!h || used.has(headers[idx]!)) continue;
      if (syns.some((s) => h === s || h.includes(s) || s.includes(h))) {
        mapping[field] = headers[idx];
        used.add(headers[idx]!);
        break;
      }
    }
  }
  return mapping;
}

function cell(row: Record<string, string>, key: string | undefined): string {
  if (!key) return "";
  return (row[key] ?? "").trim();
}

export function rowsToObjects(headers: string[], dataRows: string[][]): Record<string, string>[] {
  return dataRows.map((cells) => {
    const o: Record<string, string> = {};
    headers.forEach((h, i) => {
      o[h] = (cells[i] ?? "").trim();
    });
    return o;
  });
}

export function mapRowToLeadPartial(row: Record<string, string>, mapping: ColumnMapping): Partial<Lead> {
  return {
    businessName: cell(row, mapping.businessName),
    contactName: cell(row, mapping.contactName),
    phone: cell(row, mapping.phone),
    email: cell(row, mapping.email),
    address: cell(row, mapping.address),
    category: cell(row, mapping.category),
    notes: cell(row, mapping.notes),
  };
}

export function validateLeadImportRow(p: Partial<Lead>): string[] {
  const errs: string[] = [];
  if (!p.businessName?.trim()) errs.push("businessName");
  return errs;
}

function dedupeKey(p: Partial<Lead>): string {
  const phone = (p.phone ?? "").replace(/\D/g, "");
  const addr = (p.address ?? "").toLowerCase().replace(/\s+/g, " ").slice(0, 80);
  const name = (p.businessName ?? "").toLowerCase().slice(0, 40);
  return `${phone}|${addr}|${name}`;
}

/** Drop rows that match an existing key or duplicate within batch. */
export function dedupePartials(batch: Partial<Lead>[], existing: Lead[]): Partial<Lead>[] {
  const seen = new Set<string>();
  for (const e of existing) {
    seen.add(dedupeKey(e));
  }
  const out: Partial<Lead>[] = [];
  for (const p of batch) {
    const k = dedupeKey(p);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out;
}
