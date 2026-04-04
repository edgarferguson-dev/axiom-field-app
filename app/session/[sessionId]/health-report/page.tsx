"use client";

import { SessionStageShell } from "@/components/session/SessionStageShell";
import { BusinessHealthReport } from "@/components/health/BusinessHealthReport";
import { useSessionStore } from "@/store/session-store";
import { resolveActiveOfferTemplate } from "@/lib/presentation/resolveActiveOfferTemplate";
import { diagnoseGaps } from "@/lib/field/gapDiagnosis";

export default function HealthReportPage({ params }: { params: { sessionId: string } }) {
  const session = useSessionStore((s) => s.session);
  const offerTemplates = useSessionStore((s) => s.offerTemplates);
  const defaultOfferTemplateId = useSessionStore((s) => s.defaultOfferTemplateId);
  const fieldRepCard = useSessionStore((s) => s.fieldRepCard);

  const business = session?.business;
  const storedGaps = session?.gapDiagnosis;
  const gaps =
    storedGaps ??
    (business ? diagnoseGaps(business, session?.placesPrimaryType ?? undefined) : null);
  const neighborhood = session?.neighborhoodComparison ?? null;

  const offer =
    session && business
      ? resolveActiveOfferTemplate({
          offerTemplates,
          defaultOfferTemplateId,
          session,
        })
      : null;

  return (
    <SessionStageShell sessionId={params.sessionId}>
      <div className="mx-auto max-w-lg pb-24 pt-4">
        {!business || !gaps || !offer ? (
          <p className="text-sm text-muted">
            Add a business on Scout and run a brief to see the full health report.
          </p>
        ) : (
          <BusinessHealthReport
            sessionId={params.sessionId}
            scoutData={business}
            gapDiagnosis={gaps}
            neighborhoodData={neighborhood}
            offerData={{ monthlyFee: offer.monthlyFee, label: offer.label }}
            repCard={fieldRepCard}
          />
        )}
      </div>
    </SessionStageShell>
  );
}
