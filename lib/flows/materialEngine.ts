export type MaterialSummary = {
  productName: string;
  targetCustomer: string;
  painSolved: string;
  coreBenefits: string[];
  proofPoints: string[];
  pricingNotes?: string;
  onboardingCta?: string;
};

function firstNonEmpty(lines: string[]): string | null {
  const v = lines.map((l) => l.trim()).find(Boolean);
  return v ?? null;
}

function takeBullets(text: string, max = 6): string[] {
  const lines = text
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter(Boolean);

  const bullets = lines
    .filter((l) => /^[-*•]\s+/.test(l) || /^\d+\.\s+/.test(l))
    .map((l) => l.replace(/^([-*•]|\d+\.)\s+/, "").trim())
    .filter(Boolean);

  return bullets.slice(0, max);
}

function extractAfterLabel(text: string, label: string): string | null {
  const re = new RegExp(`${label}\\s*:\\s*(.+)`, "i");
  const m = text.match(re);
  return m?.[1]?.trim() ?? null;
}

// Very lightweight ingestion: deterministic + room for later NLP/LLM.
export function ingestSalesMaterial(input: {
  rawText?: string;
  bulletPoints?: string;
  websiteCopy?: string;
  pdfTextPlaceholder?: string;
}): MaterialSummary {
  const raw = [
    input.rawText ?? "",
    input.bulletPoints ?? "",
    input.websiteCopy ?? "",
    input.pdfTextPlaceholder ?? "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  const lines = raw.split(/\r?\n/g).map((l) => l.trim()).filter(Boolean);

  const productName =
    extractAfterLabel(raw, "Product") ??
    extractAfterLabel(raw, "Product name") ??
    firstNonEmpty(lines) ??
    "Axiom Signal";

  const targetCustomer =
    extractAfterLabel(raw, "Target") ??
    extractAfterLabel(raw, "Customer") ??
    "Local service businesses";

  const painSolved =
    extractAfterLabel(raw, "Pain") ??
    extractAfterLabel(raw, "Problem") ??
    "Leads go cold before the business responds, causing lost jobs that never get tracked.";

  const pricingNotes = extractAfterLabel(raw, "Pricing") ?? extractAfterLabel(raw, "Price");
  const onboardingCta = extractAfterLabel(raw, "CTA") ?? extractAfterLabel(raw, "Onboarding CTA");

  const bullets = takeBullets(raw, 12);
  const coreBenefits = bullets.slice(0, 5).length
    ? bullets.slice(0, 5)
    : [
        "Instant response to inbound leads",
        "After-hours coverage",
        "Fewer missed follow-ups",
        "Clear conversion visibility",
      ];

  const proofPoints = bullets.slice(5, 10).length
    ? bullets.slice(5, 10)
    : ["Believable interactive demo", "Rep coaching overlay", "Structured objection handling"];

  return {
    productName,
    targetCustomer,
    painSolved,
    coreBenefits,
    proofPoints,
    pricingNotes: pricingNotes ?? undefined,
    onboardingCta: onboardingCta ?? undefined,
  };
}

