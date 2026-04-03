import type { CrmAdapter } from "./base";
import type {
  CrmBusinessInput,
  CrmContactInput,
  CrmNoteTarget,
  CrmOpportunityInput,
  CrmTaskInput,
} from "./types";

function baseUrl() {
  return process.env.GHL_API_BASE_URL ?? "https://services.leadconnectorhq.com";
}

function headers(): Record<string, string> | null {
  const token = process.env.GHL_API_KEY;
  const ver = process.env.GHL_API_VERSION ?? "2021-07-28";
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    Version: ver,
    "Content-Type": "application/json",
  };
}

function locationId() {
  return process.env.GHL_LOCATION_ID ?? "";
}

/**
 * Go High Level — contacts + workflows; company/opportunity mapped lightly.
 */
export function createGhlAdapter(): CrmAdapter {
  return {
    id: "ghl",

    async upsertContact(input: CrmContactInput) {
      const h = headers();
      const loc = locationId();
      if (!h || !loc) return null;
      try {
        const res = await fetch(`${baseUrl()}/contacts/`, {
          method: "POST",
          headers: h,
          body: JSON.stringify({
            locationId: loc,
            email: input.email,
            phone: input.phone,
            firstName: input.firstName,
            lastName: input.lastName,
            companyName: input.companyName,
            tags: input.tags ?? ["dani-field"],
          }),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { contact?: { id?: string }; id?: string };
        const id = data.contact?.id ?? data.id;
        return id ? { id } : null;
      } catch {
        return null;
      }
    },

    async upsertBusiness(input: CrmBusinessInput) {
      const h = headers();
      const loc = locationId();
      if (!h || !loc) return null;
      try {
        const res = await fetch(`${baseUrl()}/companies/`, {
          method: "POST",
          headers: h,
          body: JSON.stringify({
            locationId: loc,
            name: input.name,
            phone: input.phone,
            address: input.address,
            website: input.website,
          }),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { id?: string; company?: { id?: string } };
        const id = data.company?.id ?? data.id;
        return id ? { id } : null;
      } catch {
        return null;
      }
    },

    async upsertOpportunity(_input: CrmOpportunityInput) {
      void _input;
      return null;
    },

    async addNote(target: CrmNoteTarget, body: string) {
      const h = headers();
      if (!h) return false;
      try {
        const res = await fetch(`${baseUrl()}/contacts/${target.id}/notes`, {
          method: "POST",
          headers: h,
          body: JSON.stringify({ body }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },

    async setTask(input: CrmTaskInput) {
      const h = headers();
      if (!h || !input.contactId) return false;
      try {
        const res = await fetch(`${baseUrl()}/contacts/${input.contactId}/tasks`, {
          method: "POST",
          headers: h,
          body: JSON.stringify({
            title: input.title,
            dueDate: input.dueAt,
            body: input.body,
          }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },

    async triggerFollowUp(key: string, contactId: string) {
      const h = headers();
      const wf = key || process.env.GHL_WORKFLOW_ID_CLOSE;
      if (!h || !wf) return false;
      try {
        const res = await fetch(`${baseUrl()}/workflows/${wf}/contacts/${contactId}`, {
          method: "POST",
          headers: h,
        });
        return res.ok;
      } catch {
        return false;
      }
    },
  };
}
