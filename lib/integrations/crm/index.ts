export type { CrmAdapter } from "./base";
export { syncSessionCloseToCrm } from "./base";
export type * from "./types";
export { createGhlAdapter } from "./ghl";
export { createHubspotAdapter } from "./hubspot";

import type { CrmAdapter } from "./base";
import { createGhlAdapter } from "./ghl";
import { createHubspotAdapter } from "./hubspot";

/** Active CRM from env — rep-facing app stays dumb; ops set `CRM_PROVIDER`. */
export function getCrmAdapter(): CrmAdapter | null {
  const p = (process.env.CRM_PROVIDER ?? "ghl").toLowerCase().trim();
  if (p === "hubspot") return createHubspotAdapter();
  if (p === "ghl" || p === "gohighlevel" || p === "highlevel") return createGhlAdapter();
  if (p === "none" || p === "off") return null;
  return createGhlAdapter();
}
