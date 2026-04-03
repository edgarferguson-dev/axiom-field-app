/** CRM is system of record — DaNI only pushes structured facts. */

export type CrmContactInput = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  /** GHL and some CRMs inline company on the person record. */
  companyName?: string;
  tags?: string[];
};

export type CrmBusinessInput = {
  name: string;
  phone?: string;
  address?: string;
  website?: string;
  category?: string;
};

export type CrmOpportunityInput = {
  name: string;
  stage?: string;
  amountCents?: number;
  contactId?: string;
  companyId?: string;
};

export type CrmTaskInput = {
  title: string;
  dueAt?: string;
  contactId?: string;
  body?: string;
};

export type CrmNoteTarget = { type: "contact" | "company" | "deal"; id: string };

export type CrmSyncResult = {
  contactId?: string;
  companyId?: string;
  dealId?: string;
  ok: boolean;
  followUpTriggered?: boolean;
};
