import type { CrmAdapter } from "./base";
import type { CrmBusinessInput, CrmContactInput, CrmNoteTarget, CrmOpportunityInput, CrmTaskInput } from "./types";

function token() {
  return process.env.HUBSPOT_ACCESS_TOKEN ?? "";
}

function headers(): Record<string, string> | null {
  const t = token();
  if (!t) return null;
  return {
    Authorization: `Bearer ${t}`,
    "Content-Type": "application/json",
  };
}

const API = "https://api.hubapi.com";

/**
 * HubSpot CRM v3 — contact + company; notes/tasks/workflows left as no-ops until wired.
 */
export function createHubspotAdapter(): CrmAdapter {
  return {
    id: "hubspot",

    async upsertContact(input: CrmContactInput) {
      const h = headers();
      if (!h) return null;
      const props: Record<string, string> = {};
      if (input.email) props.email = input.email;
      if (input.phone) props.phone = input.phone;
      if (input.firstName) props.firstname = input.firstName;
      if (input.lastName) props.lastname = input.lastName;
      if (input.companyName) props.company = input.companyName;

      try {
        const res = await fetch(`${API}/crm/v3/objects/contacts`, {
          method: "POST",
          headers: h,
          body: JSON.stringify({ properties: props }),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { id?: string };
        return data.id ? { id: data.id } : null;
      } catch {
        return null;
      }
    },

    async upsertBusiness(input: CrmBusinessInput) {
      const h = headers();
      if (!h) return null;
      try {
        const res = await fetch(`${API}/crm/v3/objects/companies`, {
          method: "POST",
          headers: h,
          body: JSON.stringify({
            properties: {
              name: input.name,
              phone: input.phone ?? "",
              address: input.address ?? "",
              website: input.website ?? "",
            },
          }),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { id?: string };
        return data.id ? { id: data.id } : null;
      } catch {
        return null;
      }
    },

    async upsertOpportunity(input: CrmOpportunityInput) {
      const h = headers();
      if (!h) return null;
      try {
        const props: Record<string, string> = { dealname: input.name };
        if (input.stage) props.dealstage = input.stage;
        if (input.amountCents != null) props.amount = String(input.amountCents / 100);
        const res = await fetch(`${API}/crm/v3/objects/deals`, {
          method: "POST",
          headers: h,
          body: JSON.stringify({ properties: props }),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { id?: string };
        return data.id ? { id: data.id } : null;
      } catch {
        return null;
      }
    },

    async addNote(_target: CrmNoteTarget, _body: string) {
      void _target;
      void _body;
      // Wire via engagements v3 + correct associationTypeId for your portal.
      return false;
    },

    async setTask(_input: CrmTaskInput) {
      void _input;
      return false;
    },

    async triggerFollowUp(_key: string, _contactId: string) {
      void _key;
      void _contactId;
      return false;
    },
  };
}
