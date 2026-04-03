import { syncSessionCloseToCrm } from "./base";
import { getCrmAdapter } from "./index";

export type CrmCloseBody = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  address?: string;
  website?: string;
  category?: string;
  note?: string;
  followUpKey?: string;
  tags?: string[];
};

export type CrmCloseResult =
  | { ok: true; synced: false; reason: "no_crm" }
  | {
      ok: boolean;
      synced: boolean;
      adapter: string;
      contactId?: string;
      companyId?: string;
      workflow: boolean;
    };

export async function handleCrmClosePost(body: CrmCloseBody): Promise<CrmCloseResult> {
  const adapter = getCrmAdapter();
  if (!adapter) {
    return { ok: true, synced: false, reason: "no_crm" };
  }

  const name = (body.companyName ?? "").trim() || "Unknown account";
  const followUpKey =
    (body.followUpKey && body.followUpKey.trim()) ||
    process.env.CRM_FOLLOWUP_KEY?.trim() ||
    process.env.GHL_WORKFLOW_ID_CLOSE?.trim() ||
    "";

  const result = await syncSessionCloseToCrm(adapter, {
    contact: {
      email: body.email,
      phone: body.phone,
      firstName: body.firstName,
      lastName: body.lastName,
      companyName: name,
      tags: Array.isArray(body.tags) ? body.tags : ["axiom-field", "close", "dani-field"],
    },
    business: {
      name,
      phone: body.phone,
      address: body.address,
      website: body.website,
      category: body.category,
    },
    note: body.note?.trim() || undefined,
    followUpKey: followUpKey || undefined,
  });

  return {
    ok: result.ok,
    synced: result.ok,
    adapter: adapter.id,
    contactId: result.contactId,
    companyId: result.companyId,
    workflow: result.followUpTriggered ?? false,
  };
}
