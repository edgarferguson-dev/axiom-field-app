/**
 * GoHighLevel — thin facade over `lib/integrations/crm` (GHL adapter).
 * Prefer `getCrmAdapter()` + `syncSessionCloseToCrm` for new code.
 */

import { createGhlAdapter } from "@/lib/integrations/crm/ghl";

export type GhlContactInput = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  tags?: string[];
};

export async function createContact(input: GhlContactInput): Promise<{ id?: string; ok: boolean }> {
  const adapter = createGhlAdapter();
  const row = await adapter.upsertContact({
    email: input.email,
    phone: input.phone,
    firstName: input.firstName,
    lastName: input.lastName,
    companyName: input.companyName,
    tags: input.tags,
  });
  return { ok: !!row?.id, id: row?.id };
}

export async function triggerWorkflow(contactId: string, workflowId?: string): Promise<boolean> {
  const adapter = createGhlAdapter();
  const key = workflowId ?? process.env.GHL_WORKFLOW_ID_CLOSE ?? "";
  if (!key) return false;
  return adapter.triggerFollowUp(key, contactId);
}
