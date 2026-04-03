import { ingestSalesMaterial, type MaterialSummary } from "@/lib/flows/materialEngine";
import type { MaterialSet, MaterialBlock } from "@/store/materials-store";

function blockToText(b: MaterialBlock): string {
  if (b.type === "text") return b.label ? `${b.label}:\n${b.value}` : b.value;
  if (b.type === "link") return `${b.label}: ${b.url}`;
  if (b.type === "slide") return `${b.title}\n${b.bullets.map((x) => `- ${x}`).join("\n")}`;
  return "";
}

/** Deterministic compile: blocks → ingest → `MaterialSummary` (AI rearrangement comes later). */
export function compileMaterialSet(set: MaterialSet): MaterialSummary {
  const rawText = set.blocks.map(blockToText).filter(Boolean).join("\n\n").trim();
  return ingestSalesMaterial({ rawText });
}

