import { buildOfferFit } from "@/lib/flows/offerFitEngine";
import type { BusinessConstraint } from "@/types/session";

export function offerFitFromConstraints(constraints: BusinessConstraint[] | undefined) {
  return buildOfferFit(constraints ?? []);
}
