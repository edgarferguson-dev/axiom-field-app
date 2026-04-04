"use client";

import Link from "next/link";
import type { BusinessProfile } from "@/types/session";
import type { FieldRepCard, GapDiagnosis, NeighborhoodComparisonState } from "@/types/scoutIntel";
import { neighborhoodPosterPayload } from "@/types/scoutIntel";
import { extractNeighborhood } from "@/lib/field/extractNeighborhood";
import {
  LeakageBarPoster,
  NeighborhoodComparePoster,
} from "@/components/presentation/controlled/DiagnosisVisuals";
import { ProofRunGapRows } from "@/components/presentation/proof-beats/ProofRunGapRows";
import { ProofRunSystemCapabilityRow } from "@/components/presentation/proof-beats/ProofRunSystemCapabilityRow";
import { ReportArtifactHeader } from "@/components/health/report/ReportArtifactHeader";
import { ReportSection } from "@/components/health/report/ReportSection";
import { ReportConditionSnapshot } from "@/components/health/report/ReportConditionSnapshot";
import { cn } from "@/lib/utils/cn";

type OfferSlice = { monthlyFee: number; label: string };

const FIX_INCLUDES = [
  "Missed-call auto text-back so leads don’t go cold",
  "Self-serve booking path when you’re on the floor",
  "Automated review prompts after jobs land",
  "Google profile kept tight with how you actually win",
] as const;

/**
 * Standalone merchant-facing health report artifact (full page + optional embed).
 * Uses normalized scout + diagnosis + neighborhood + offer only — no diagnosis recompute here.
 */
export function BusinessHealthReport(props: {
  sessionId: string;
  scoutData: BusinessProfile;
  gapDiagnosis: GapDiagnosis;
  neighborhoodContext: NeighborhoodComparisonState;
  offerData?: OfferSlice | null;
  repCard: FieldRepCard;
  showSessionLink?: boolean;
  /** Shown under header, e.g. visit date */
  preparedLine: string;
  /** Optional one-line from pre-call intel for leakage context */
  missedValueLine?: string | null;
}) {
  const {
    sessionId,
    scoutData,
    gapDiagnosis,
    neighborhoodContext,
    offerData,
    repCard,
    showSessionLink = true,
    preparedLine,
    missedValueLine,
  } = props;

  const hood = extractNeighborhood(scoutData.address);
  const neighborhoodPoster = neighborhoodPosterPayload(neighborhoodContext);
  const categoryLine = scoutData.type?.trim() ?? "";
  const areaLine = [hood, scoutData.address?.trim()].filter(Boolean).join(" · ");

  const reportUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/session/${sessionId}/health-report`
      : `/session/${sessionId}/health-report`;

  const ownerPhoneDigits = scoutData.contactPhone?.replace(/\D/g, "") ?? "";
  const canTextOwner = ownerPhoneDigits.length >= 10;

  async function shareReport() {
    const url = typeof window !== "undefined" ? window.location.href : reportUrl;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Health report — ${scoutData.name}`,
          text: `Business health report for ${scoutData.name}`,
          url,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        window.alert("Link copied — send it in whatever channel you use with the owner.");
      }
    } catch {
      /* cancelled */
    }
  }

  function textToOwner() {
    if (!canTextOwner) return;
    const url = typeof window !== "undefined" ? `${window.location.origin}/session/${sessionId}/health-report` : reportUrl;
    const message = encodeURIComponent(
      `Hi — here’s the business health report we walked through for ${scoutData.name}. Worth a look when you have a minute: ${url}`
    );
    window.open(`sms:${ownerPhoneDigits}?body=${message}`, "_blank", "noopener,noreferrer");
  }

  const hasRepContact =
    Boolean(repCard.displayName?.trim()) ||
    Boolean(repCard.org?.trim()) ||
    Boolean(repCard.phone?.trim()) ||
    Boolean(repCard.email?.trim());

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 pb-8 sm:space-y-5">
      <ReportArtifactHeader
        businessName={scoutData.name}
        categoryType={categoryLine}
        areaContext={areaLine}
        preparedLine={preparedLine}
      />

      <ReportSection kicker="Current condition" title="How things look today">
        <div className="space-y-4">
          <ReportConditionSnapshot ratingRaw={scoutData.rating} reviewCountRaw={scoutData.reviewCount} />
          <ProofRunGapRows diagnosis={gapDiagnosis} />
        </div>
      </ReportSection>

      <ReportSection kicker="Estimated leakage" title="Missed opportunity (directional)">
        <LeakageBarPoster monthlyLeakage={gapDiagnosis.estimatedMonthlyLeakage} className="border-white/10" />
        <p className="mt-3 text-center text-xs leading-relaxed text-white/50 sm:text-left">
          Illustrative model: ~8 missed touches/week × ${gapDiagnosis.avgTicket} avg ticket — not a quote or guarantee.
        </p>
        {missedValueLine?.trim() ? (
          <p className="mt-3 rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2.5 text-sm leading-snug text-white/75">
            {missedValueLine.trim()}
          </p>
        ) : null}
      </ReportSection>

      {neighborhoodPoster ? (
        <ReportSection kicker="Nearby context" title="Similar businesses in the area">
          <p className="mb-3 text-xs leading-relaxed text-white/50">
            Neutral snapshot from Maps — context only, not a scorecard against competitors.
          </p>
          <NeighborhoodComparePoster data={neighborhoodPoster} />
        </ReportSection>
      ) : null}

      <ReportSection kicker="What the fix includes" title="What runs in the background">
        <ul className="space-y-2.5">
          {FIX_INCLUDES.map((line) => (
            <li key={line}>
              <ProofRunSystemCapabilityRow title={line} />
            </li>
          ))}
        </ul>
      </ReportSection>

      <ReportSection kicker="Pilot" title="Commercial next step" variant="emphasis">
        {offerData ? (
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-lg font-bold text-white">{offerData.label}</p>
            <p className="text-3xl font-black tabular-nums text-teal-200 sm:text-4xl">${offerData.monthlyFee}/mo</p>
            <p className="text-xs text-white/55">Terms confirmed in writing after yes — short pilot, no long contract lecture.</p>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-white/70">
            Pilot pricing is set with your rep for this location. Nothing is wrong with this page — the number lives in
            your conversation and a short written follow-up.
          </p>
        )}
      </ReportSection>

      {hasRepContact ? (
        <ReportSection kicker="Prepared by" title="Your field contact">
          <div className="space-y-1 text-sm">
            {repCard.displayName?.trim() ? (
              <p className="text-base font-bold text-white">{repCard.displayName.trim()}</p>
            ) : null}
            {repCard.org?.trim() ? <p className="text-white/60">{repCard.org.trim()}</p> : null}
            <div className="mt-2 space-y-1 text-teal-200/95">
              {repCard.phone?.trim() ? <p>{repCard.phone.trim()}</p> : null}
              {repCard.email?.trim() ? <p className="break-all">{repCard.email.trim()}</p> : null}
            </div>
          </div>
        </ReportSection>
      ) : null}

      <ReportSection kicker="Next step" title="Keep this page">
        <p className="text-sm leading-relaxed text-white/80">
          Save or share this link — it’s the same diagnosis you saw in the proof run. Reply to your rep with questions,
          or loop in a partner when you’re ready.
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          <button type="button" className="btn-primary" onClick={() => void shareReport()}>
            Share report
          </button>
          {canTextOwner ? (
            <button type="button" className="btn-secondary" onClick={textToOwner}>
              Text link to owner
            </button>
          ) : (
            <div
              className={cn(
                "flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-black/30 px-4 text-center text-xs text-white/45"
              )}
            >
              Add the owner’s mobile on the scout card to text this link from your device.
            </div>
          )}
          {showSessionLink ? (
            <Link
              href={`/session/${sessionId}/demo`}
              className="btn-secondary inline-flex min-h-12 items-center justify-center no-underline"
            >
              Back to proof run
            </Link>
          ) : null}
        </div>
      </ReportSection>
    </div>
  );
}
