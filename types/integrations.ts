/**
 * Future-ready integration stubs.
 *
 * These types scaffold DocuSign, GoHighLevel, and demo-materials handoffs.
 * None are wired to external APIs yet — they define the contract so the
 * session data model is already shaped correctly when those integrations land.
 *
 * Each stub is marked @stub in its JSDoc.
 */

// ── Demo materials ─────────────────────────────────────────────────────────

/**
 * A niche-specific demo asset for presentation loading.
 * @stub Future: load from a CMS or static manifest by niche + problem.
 */
export type DemoMaterial = {
  id: string;
  title: string;
  niche: string;
  problem: string;
  proofType: "case-study" | "screenshot" | "testimonial" | "stat";
  mediaUrl?: string;
  /** Which offer component or GHL feature this asset supports. */
  offerTieIn?: string;
};

// ── DocuSign handoff ───────────────────────────────────────────────────────

/**
 * Proposal/agreement payload for DocuSign signature flow.
 * @stub Future: prefill template, send envelope, poll status.
 */
export type ProposalPayload = {
  clientName: string;
  clientEmail: string;
  businessName: string;
  packageName: string;
  packagePrice?: number;
  monthlyFee?: number;
  setupFee?: number;
  signerName?: string;
  signerEmail?: string;
  /** DocuSign envelope/template ID — set when DocuSign is wired. */
  templateId?: string;
  status: "draft" | "sent" | "signed" | "declined";
  sentAt?: number;
  signedAt?: number;
};

/**
 * Build a draft ProposalPayload from close-screen data.
 * @stub Call DocuSign API when ready.
 */
export function buildProposalPayload(params: {
  clientName: string;
  clientEmail: string;
  businessName: string;
  packageName: string;
  packagePrice?: number;
}): ProposalPayload {
  return {
    clientName: params.clientName,
    clientEmail: params.clientEmail,
    businessName: params.businessName,
    packageName: params.packageName,
    packagePrice: params.packagePrice,
    status: "draft",
  };
}

// ── GoHighLevel handoff ────────────────────────────────────────────────────

export type GHLPipelineStage =
  | "new-lead"
  | "discovery"
  | "proposal"
  | "follow-up"
  | "won"
  | "lost";

/**
 * Opportunity payload for GHL pipeline creation or update.
 * @stub Future: POST to GHL API, trigger onboarding workflow.
 */
export type GHLOpportunityPayload = {
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  businessName: string;
  businessType?: string;
  pipelineStage: GHLPipelineStage;
  assignedTo?: string;
  packageInterest?: string;
  monetaryValue?: number;
  /** GHL workflow trigger ID — set when GHL is wired. */
  workflowId?: string;
  /** GHL location/sub-account ID. */
  locationId?: string;
  notes?: string;
  tags?: string[];
};

/**
 * Build a GHLOpportunityPayload from session disposition data.
 * @stub Call GHL Opportunities API when ready.
 */
export function buildGHLPayload(params: {
  businessName: string;
  businessType?: string;
  contactName?: string;
  packageInterest?: string;
  stage: GHLPipelineStage;
  notes?: string;
}): GHLOpportunityPayload {
  return {
    contactName: params.contactName ?? params.businessName,
    businessName: params.businessName,
    businessType: params.businessType,
    pipelineStage: params.stage,
    packageInterest: params.packageInterest,
    notes: params.notes,
    tags: [params.businessType ?? "field-lead"].filter(Boolean),
  };
}
