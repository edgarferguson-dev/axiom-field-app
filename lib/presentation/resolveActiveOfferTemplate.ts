import type { Session } from "@/types/session";
import {
  DEFAULT_OFFER_TEMPLATES,
  DEFAULT_OFFER_TEMPLATE_ID,
  type OfferTemplate,
} from "@/types/offerTemplate";

type ResolveInput = {
  offerTemplates: OfferTemplate[] | undefined;
  defaultOfferTemplateId: string | undefined;
  session: Session | null;
};

export function resolveActiveOfferTemplate(input: ResolveInput): OfferTemplate {
  const templates =
    input.offerTemplates && input.offerTemplates.length > 0
      ? input.offerTemplates
      : DEFAULT_OFFER_TEMPLATES;
  const runId = input.session?.presentation?.runOfferTemplateId;
  if (runId) {
    const pick = templates.find((t) => t.id === runId);
    if (pick) return pick;
  }
  const defId = input.defaultOfferTemplateId || DEFAULT_OFFER_TEMPLATE_ID;
  const def = templates.find((t) => t.id === defId);
  return def ?? templates[0]!;
}
