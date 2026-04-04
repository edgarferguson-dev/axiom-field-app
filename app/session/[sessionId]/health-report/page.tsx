"use client";

import { SessionStageShell } from "@/components/session/SessionStageShell";
import { BusinessHealthReport } from "@/components/health/BusinessHealthReport";
import { useSessionStore } from "@/store/session-store";
import { resolveActiveOfferTemplate } from "@/lib/presentation/resolveActiveOfferTemplate";
import { NEIGHBORHOOD_CONTEXT_IDLE } from "@/types/scoutIntel";
import { DEFAULT_OFFER_TEMPLATES } from "@/types/offerTemplate";
import Link from "next/link";

export default function HealthReportPage({ params }: { params: { sessionId: string } }) {
  const session = useSessionStore((s) => s.session);
  const offerTemplates = useSessionStore((s) => s.offerTemplates);
  const defaultOfferTemplateId = useSessionStore((s) => s.defaultOfferTemplateId);
  const fieldRepCard = useSessionStore((s) => s.fieldRepCard);

  const business = session?.business;
  const gapDiagnosis = session?.gapDiagnosis;
  const neighborhoodContext = session?.neighborhoodContext ?? NEIGHBORHOOD_CONTEXT_IDLE;

  const offer =
    session && business
      ? resolveActiveOfferTemplate({
          offerTemplates: offerTemplates.length > 0 ? offerTemplates : DEFAULT_OFFER_TEMPLATES,
          defaultOfferTemplateId,
          session,
        })
      : null;

  const preparedLine = session?.createdAt
    ? `Prepared from your visit · ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(session.createdAt))}`
    : `Prepared · ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date())}`;

  const missedValueLine = session?.preCallIntel?.missedValueEstimate ?? null;

  return (
    <SessionStageShell sessionId={params.sessionId}>
      <div className="mx-auto max-w-xl px-3 pb-28 pt-4 sm:px-4 sm:pt-6">
        {!business || !gapDiagnosis ? (
          <div className="rounded-2xl border border-ink-border bg-ink-900 px-5 py-8 text-center text-white shadow-[0_12px_40px_rgb(0_0_0/0.2)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/90">Health report</p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Complete scout and lock diagnosis on this session — the full artifact appears here for the owner to keep.
            </p>
            <Link
              href={`/session/${params.sessionId}/field-read`}
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-600 px-6 text-sm font-bold text-white no-underline transition hover:bg-teal-500"
            >
              Open scout
            </Link>
          </div>
        ) : (
          <BusinessHealthReport
            sessionId={params.sessionId}
            scoutData={business}
            gapDiagnosis={gapDiagnosis}
            neighborhoodContext={neighborhoodContext}
            offerData={offer ? { monthlyFee: offer.monthlyFee, label: offer.label } : null}
            repCard={fieldRepCard}
            preparedLine={preparedLine}
            missedValueLine={missedValueLine}
          />
        )}
      </div>
    </SessionStageShell>
  );
}
