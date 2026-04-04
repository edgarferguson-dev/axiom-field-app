import type { BusinessProfile, PreCallIntel } from "@/types/session";
import type { PresentationSlide, StrategyPackage } from "@/lib/flows/presentationEngine";
import type { OpeningMode } from "@/types/presentationPack";
import { DEFAULT_OPENING_MODE, DEFAULT_PRESENTATION_PACK_ID } from "@/types/presentationPack";
import {
  DEFAULT_OFFER_TEMPLATES,
  DEFAULT_OFFER_TEMPLATE_ID,
  type OfferTemplate,
} from "@/types/offerTemplate";
import { getPresentationPackDefinition, type PresentationPackDefinition } from "@/lib/presentation/packs/registry";
import {
  buildAppointmentComparison,
  buildAppointmentImpact,
  buildAppointmentMockFlow,
  buildAppointmentProofSnapshot,
  buildInquiryComparison,
  buildInquiryImpact,
  buildInquiryMockFlow,
  buildInquiryProofSnapshot,
  buildSharedActions,
  buildSharedDecisionNext,
  buildSharedPricing,
  type MerchantBuildCtx,
} from "@/lib/presentation/merchantProofRuns";
import { merchantShortName } from "@/lib/presentation/merchantContext";

/**
 * Phase 7B — merchant proof run: five proof beats + bridge + single ask + commit.
 */
type DeckSegment =
  | "proof-snapshot"
  | "comparison"
  | "mock-flow"
  | "impact"
  | "decision-next"
  | "pricing"
  | "health-report-share"
  | "actions";

type CoreBeat = Exclude<DeckSegment, "decision-next" | "pricing" | "health-report-share" | "actions">;

function coreBeatOrder(mode: OpeningMode): CoreBeat[] {
  switch (mode) {
    case "proof-snapshot":
      return ["proof-snapshot", "comparison", "mock-flow", "impact"];
    case "micro-demo":
      return ["mock-flow", "proof-snapshot", "comparison", "impact"];
    case "pain-to-proof":
      return ["comparison", "impact", "proof-snapshot", "mock-flow"];
    default:
      return ["proof-snapshot", "comparison", "mock-flow", "impact"];
  }
}

function segmentOrder(mode: OpeningMode): DeckSegment[] {
  return [...coreBeatOrder(mode), "decision-next", "pricing", "health-report-share", "actions"];
}

type BuildCtx = MerchantBuildCtx;

function isInquiryPack(pack: PresentationPackDefinition): boolean {
  return pack.id === "inquiry-local";
}

function buildProofSnapshot(ctx: BuildCtx): PresentationSlide {
  const body = isInquiryPack(ctx.pack) ? buildInquiryProofSnapshot(ctx) : buildAppointmentProofSnapshot(ctx);
  return { id: `${ctx.idPrefix}-proof-snapshot`, ...body };
}

function buildComparison(ctx: BuildCtx): PresentationSlide {
  const body = isInquiryPack(ctx.pack) ? buildInquiryComparison(ctx) : buildAppointmentComparison(ctx);
  return { id: `${ctx.idPrefix}-compare`, ...body };
}

function buildMockFlow(ctx: BuildCtx): PresentationSlide {
  const body = isInquiryPack(ctx.pack) ? buildInquiryMockFlow(ctx) : buildAppointmentMockFlow(ctx);
  return { id: `${ctx.idPrefix}-mock-flow`, ...body };
}

function buildImpact(ctx: BuildCtx): PresentationSlide {
  const body = isInquiryPack(ctx.pack) ? buildInquiryImpact(ctx) : buildAppointmentImpact(ctx);
  return { id: `${ctx.idPrefix}-impact`, ...body };
}

function buildDecisionNext(ctx: BuildCtx): PresentationSlide {
  const body = buildSharedDecisionNext(ctx);
  return { id: `${ctx.idPrefix}-decision-bridge`, ...body };
}

function buildPricing(ctx: BuildCtx, offer: OfferTemplate): PresentationSlide {
  const body = buildSharedPricing(ctx, offer);
  return { id: `${ctx.idPrefix}-pricing`, ...body };
}

function buildActions(ctx: BuildCtx): PresentationSlide {
  const body = buildSharedActions();
  return { id: `${ctx.idPrefix}-actions`, ...body };
}

function buildHealthReportShare(ctx: BuildCtx): PresentationSlide {
  const n = merchantShortName(ctx.business);
  return {
    id: `${ctx.idPrefix}-health-share`,
    type: "health-report-share",
    kicker: "Beat 6",
    title: "Health report",
    subtitle: `Preview and share a one-pager for ${n}.`,
  };
}

function buildSegment(segment: DeckSegment, ctx: BuildCtx, offer: OfferTemplate): PresentationSlide {
  switch (segment) {
    case "proof-snapshot":
      return buildProofSnapshot(ctx);
    case "comparison":
      return buildComparison(ctx);
    case "mock-flow":
      return buildMockFlow(ctx);
    case "impact":
      return buildImpact(ctx);
    case "decision-next":
      return buildDecisionNext(ctx);
    case "pricing":
      return buildPricing(ctx, offer);
    case "health-report-share":
      return buildHealthReportShare(ctx);
    case "actions":
      return buildActions(ctx);
  }
}

function defaultWorkspaceOffer(): OfferTemplate {
  return (
    DEFAULT_OFFER_TEMPLATES.find((t) => t.id === DEFAULT_OFFER_TEMPLATE_ID) ?? DEFAULT_OFFER_TEMPLATES[0]!
  );
}

/** Phase 7B/7D — merchant proof runs; ask beat uses `offer` (single tier in-room). */
export function generateProofLedSlides(
  business: BusinessProfile,
  strategy: StrategyPackage,
  intel: PreCallIntel | null | undefined,
  packId: string = DEFAULT_PRESENTATION_PACK_ID,
  openingMode: OpeningMode = DEFAULT_OPENING_MODE,
  offer: OfferTemplate = defaultWorkspaceOffer()
): PresentationSlide[] {
  const idPrefix = `slide-${business.type || "biz"}`.toLowerCase().replace(/\s+/g, "-");
  const pack = getPresentationPackDefinition(packId);
  const mode = openingMode ?? pack.defaultOpeningMode;
  const ctx: BuildCtx = { idPrefix, business, strategy, intel, pack };
  const order = segmentOrder(mode);
  return order.map((seg) => buildSegment(seg, ctx, offer));
}

export function generatePresentationSlides(
  business: BusinessProfile,
  strategy: StrategyPackage,
  intel?: PreCallIntel | null
): PresentationSlide[] {
  return generateProofLedSlides(business, strategy, intel, DEFAULT_PRESENTATION_PACK_ID, DEFAULT_OPENING_MODE);
}
