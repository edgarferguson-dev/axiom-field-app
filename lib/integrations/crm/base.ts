import type {
  CrmBusinessInput,
  CrmContactInput,
  CrmNoteTarget,
  CrmOpportunityInput,
  CrmSyncResult,
  CrmTaskInput,
} from "./types";

/**
 * Provider-agnostic CRM port — implement per vendor (GHL, HubSpot, …).
 */
export interface CrmAdapter {
  readonly id: string;

  upsertContact(input: CrmContactInput): Promise<{ id: string } | null>;

  upsertBusiness(input: CrmBusinessInput): Promise<{ id: string } | null>;

  upsertOpportunity(input: CrmOpportunityInput): Promise<{ id: string } | null>;

  addNote(target: CrmNoteTarget, body: string): Promise<boolean>;

  setTask(input: CrmTaskInput): Promise<boolean>;

  /** Workflow / sequence / list enrollment — vendor-specific `key` from env mapping. */
  triggerFollowUp(key: string, contactId: string): Promise<boolean>;
}

/** High-level close sync — adapters implement internals. */
export async function syncSessionCloseToCrm(
  adapter: CrmAdapter,
  payload: {
    contact: CrmContactInput;
    business: CrmBusinessInput;
    note?: string;
    followUpKey?: string;
  }
): Promise<CrmSyncResult> {
  const company = await adapter.upsertBusiness(payload.business);
  const contact = await adapter.upsertContact({
    ...payload.contact,
  });
  const contactId = contact?.id;
  if (contactId && payload.note) {
    await adapter.addNote({ type: "contact", id: contactId }, payload.note);
  }
  let followUpTriggered = false;
  if (contactId && payload.followUpKey) {
    followUpTriggered = await adapter.triggerFollowUp(payload.followUpKey, contactId);
  }
  return {
    ok: !!contactId || !!company?.id,
    contactId,
    companyId: company?.id,
    followUpTriggered,
  };
}
