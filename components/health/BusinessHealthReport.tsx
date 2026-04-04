"use client";

import Link from "next/link";
import type { BusinessProfile } from "@/types/session";
import type { FieldRepCard, GapDiagnosis, NeighborhoodComparison } from "@/types/scoutIntel";
import { extractNeighborhood } from "@/lib/field/extractNeighborhood";

type OfferSlice = { monthlyFee: number; label: string };

function parseRating(r?: string): number | null {
  if (r == null || r === "") return null;
  const n = Number.parseFloat(String(r).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseReviews(r?: string): number | null {
  if (r == null || r === "") return null;
  const n = Number.parseInt(String(r).replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

export function BusinessHealthReport(props: {
  sessionId: string;
  scoutData: BusinessProfile;
  gapDiagnosis: GapDiagnosis;
  neighborhoodData: NeighborhoodComparison | null;
  offerData: OfferSlice;
  repCard: FieldRepCard;
  /** When false, omit link back to session (standalone / embed). */
  showSessionLink?: boolean;
}) {
  const {
    sessionId,
    scoutData,
    gapDiagnosis,
    neighborhoodData,
    offerData,
    repCard,
    showSessionLink = true,
  } = props;

  const googleRating = parseRating(scoutData.rating);
  const reviewCount = parseReviews(scoutData.reviewCount);
  const hood = extractNeighborhood(scoutData.address);

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
      className="card-primary mx-auto max-w-[420px] px-6 py-6 text-white"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      <div className="mb-6 text-center">
        <div className="text-caption text-accent">BUSINESS HEALTH REPORT</div>
        <div className="text-title mt-2">{scoutData.name}</div>
        <div className="text-secondary mt-1">
          {scoutData.type} · {hood}
        </div>
      </div>

      <div className="card-secondary mb-4">
        <div className="text-caption mb-3">YOUR CURRENT SCORE</div>
        <div className="mb-2 flex justify-between text-body">
          <span>Google Rating</span>
          <span
            className={
              googleRating != null && googleRating >= 4.5 ? "text-accent" : "text-negative"
            }
          >
            {googleRating != null ? `${googleRating} ★` : "—"}
          </span>
        </div>
        <div className="mb-2 flex justify-between text-body">
          <span>Reviews</span>
          <span>{reviewCount ?? "—"}</span>
        </div>
        {gapDiagnosis.gaps.map((gap) => (
          <div key={gap.type} className="mb-2 flex justify-between text-body">
            <span>{gap.label}</span>
            <span className="text-negative">✗</span>
          </div>
        ))}
      </div>

      <div className="card-secondary mb-4 text-center">
        <div className="text-caption mb-2">ESTIMATED MONTHLY LEAKAGE</div>
        <div className="text-price">~${gapDiagnosis.estimatedMonthlyLeakage.toLocaleString()}</div>
        <div className="mt-1 text-[13px] text-secondary">
          ~8 missed opportunities/week × ${gapDiagnosis.avgTicket} average
        </div>
      </div>

      {neighborhoodData ? (
        <div className="card-secondary mb-4">
          <div className="text-caption mb-3">YOUR NEIGHBORHOOD</div>
          <div className="mb-2 text-body">
            <span className="font-bold text-accent">{neighborhoodData.totalNearby}</span> similar
            businesses within 0.5 miles
          </div>
          <div className="mb-2 text-body">
            <span className="font-bold text-accent">{neighborhoodData.withBooking}</span> of them have
            a website link on Google
          </div>
          <div className="mb-2 text-body">
            <span className="font-bold text-accent">{neighborhoodData.withHighRating}</span> of them
            have 4.5+ stars
          </div>
          <div className="text-[13px] text-secondary">
            Avg: {neighborhoodData.avgRating.toFixed(1)} stars · {Math.round(neighborhoodData.avgReviews)}{" "}
            reviews
          </div>
        </div>
      ) : null}

      <div className="card-secondary mb-4">
        <div className="text-caption mb-3">WHAT THE FIX LOOKS LIKE</div>
        {[
          "Missed-call auto text-back",
          "24/7 online booking",
          "Automated review requests",
          "Google profile optimization",
        ].map((item) => (
          <div key={item} className="mb-2 flex items-center gap-2 text-body">
            <span className="text-accent">✓</span>
            <span>{item}</span>
          </div>
        ))}
        <div className="mt-4 text-center">
          <div className="text-price">${offerData.monthlyFee}/mo</div>
          <div className="text-secondary text-sm">Free setup · No contract</div>
        </div>
      </div>

      <div className="card-secondary text-center">
        <div className="text-caption mb-2">PREPARED BY</div>
        <div className="font-bold">{repCard.displayName}</div>
        <div className="text-secondary">{repCard.org}</div>
        {(repCard.phone || repCard.email) && (
          <div className="mt-2 text-sm text-accent">
            {repCard.phone ? <div>{repCard.phone}</div> : null}
            {repCard.email ? <div>{repCard.email}</div> : null}
          </div>
        )}
        <div className="mt-4 flex flex-col gap-2">
          <button type="button" className="btn-primary" onClick={() => void shareReport()}>
            Share health report
          </button>
          <button type="button" className="btn-secondary" onClick={textToOwner}>
            Text to owner
          </button>
          {showSessionLink ? (
            <Link href={`/session/${sessionId}/demo`} className="btn-secondary inline-block text-center no-underline">
              Back to proof run
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
