"use client";

import Link from "next/link";
import type { BusinessProfile } from "@/types/session";
import type { FieldRepCard, GapDiagnosis, NeighborhoodComparisonState } from "@/types/scoutIntel";
import { neighborhoodPosterPayload } from "@/types/scoutIntel";
import { extractNeighborhood } from "@/lib/field/extractNeighborhood";
import { parseScoutRating, parseScoutReviewCount } from "@/lib/field/gapDiagnosis";
import {
  GapChipList,
  LeakageBarPoster,
  NeighborhoodComparePoster,
  RatingGapStrip,
} from "@/components/presentation/controlled/DiagnosisVisuals";

type OfferSlice = { monthlyFee: number; label: string };

export function BusinessHealthReport(props: {
  sessionId: string;
  scoutData: BusinessProfile;
  gapDiagnosis: GapDiagnosis;
  neighborhoodContext: NeighborhoodComparisonState;
  /** Optional — scout completion does not depend on a configured offer template. */
  offerData?: OfferSlice | null;
  repCard: FieldRepCard;
  /** When false, omit link back to session (standalone / embed). */
  showSessionLink?: boolean;
}) {
  const {
    sessionId,
    scoutData,
    gapDiagnosis,
    neighborhoodContext,
    offerData,
    repCard,
    showSessionLink = true,
  } = props;

  const googleRating = parseScoutRating(scoutData.rating);
  const reviewCount = parseScoutReviewCount(scoutData.reviewCount);
  const hood = extractNeighborhood(scoutData.address);
  const neighborhoodPoster = neighborhoodPosterPayload(neighborhoodContext);

  const reportUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/session/${sessionId}/health-report`
      : `/session/${sessionId}/health-report`;

  async function shareReport() {
    const url = typeof window !== "undefined" ? window.location.href : reportUrl;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Health Report — ${scoutData.name}`,
          text: `Business health report for ${scoutData.name}`,
          url,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        window.alert("Link copied!");
      }
    } catch {
      /* user cancelled share */
    }
  }

  function textToOwner() {
    const phone = scoutData.contactPhone?.replace(/\D/g, "") ?? "";
    const message = encodeURIComponent(
      `Hey! I put together a quick business health report for ${scoutData.name}. Take a look when you get a chance: ${reportUrl}`
    );
    if (!phone) {
      window.alert("Add a phone number on the scout card first.");
      return;
    }
    window.open(`sms:${phone}?body=${message}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      className="mx-auto max-w-[420px] rounded-2xl border border-teal-500/20 bg-[#141414] px-5 py-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:px-6"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      <header className="mb-6 border-b border-white/10 pb-5 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-400/95">
          Business health report
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">{scoutData.name}</h1>
        <p className="mt-1 text-sm text-white/60">
          {scoutData.type} · {hood}
        </p>
      </header>

      <section className="mb-5 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/90">Snapshot</p>
        <RatingGapStrip rating={googleRating} reviewCount={reviewCount} />
      </section>

      <section className="mb-5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/90">Current gaps</p>
        <GapChipList diagnosis={gapDiagnosis} />
      </section>

      <section className="mb-5 space-y-2">
        <LeakageBarPoster monthlyLeakage={gapDiagnosis.estimatedMonthlyLeakage} />
        <p className="text-center text-[12px] text-white/45">
          ~8 missed touches/wk × ${gapDiagnosis.avgTicket} avg ticket — directional, not a guarantee.
        </p>
      </section>

      {neighborhoodPoster ? (
        <section className="mb-5">
          <NeighborhoodComparePoster data={neighborhoodPoster} />
        </section>
      ) : null}

      <section className="mb-5 rounded-xl border border-white/10 bg-black/35 px-4 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/90">What the fix includes</p>
        <ul className="mt-3 space-y-2.5 text-sm text-white/88">
          {[
            "Missed-call auto text-back",
            "24/7 online booking path",
            "Automated review requests",
            "Google profile tightening",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 text-teal-400">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-white/10 pt-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Selected offer</p>
          {offerData ? (
            <>
              <p className="mt-1 text-lg font-bold text-white">{offerData.label}</p>
              <p className="text-2xl font-black tabular-nums text-teal-300">${offerData.monthlyFee}/mo</p>
              <p className="mt-1 text-xs text-white/50">Free setup · No long contract</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-white/60">
              Configure a pilot offer in settings to show pricing on this card.
            </p>
          )}
        </div>
      </section>

      <section className="mb-5 rounded-xl border border-teal-500/35 bg-teal-500/[0.06] px-4 py-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400">Next step</p>
        <p className="mt-2 text-sm font-medium leading-snug text-white/88">
          Reply to {repCard.displayName} with questions, or text the number on file. This page is yours to keep —
          share it with a partner or manager.
        </p>
      </section>

      <footer className="rounded-xl border border-white/10 bg-black/25 px-4 py-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Prepared by</p>
        <p className="mt-1 font-bold text-white">{repCard.displayName}</p>
        <p className="text-sm text-white/55">{repCard.org}</p>
        {(repCard.phone || repCard.email) && (
          <div className="mt-2 space-y-0.5 text-sm text-teal-300/95">
            {repCard.phone ? <div>{repCard.phone}</div> : null}
            {repCard.email ? <div>{repCard.email}</div> : null}
          </div>
        )}
        <div className="mt-4 flex flex-col gap-2">
          <button type="button" className="btn-primary" onClick={() => void shareReport()}>
            Share report
          </button>
          <button type="button" className="btn-secondary" onClick={textToOwner}>
            Text link to owner
          </button>
          {showSessionLink ? (
            <Link href={`/session/${sessionId}/demo`} className="btn-secondary inline-block text-center no-underline">
              Back to proof run
            </Link>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
