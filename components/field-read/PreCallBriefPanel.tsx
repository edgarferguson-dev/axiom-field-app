"use client";

import type { ReactNode } from "react";
import type { BusinessProfile, PreCallIntel, RiskBand, TabletGuidance, ChannelMode } from "@/types/session";
import type { GapDiagnosis, NeighborhoodComparisonState, PainBriefExtras } from "@/types/scoutIntel";
import { neighborhoodPosterPayload } from "@/types/scoutIntel";
import {
  LeakageBarPoster,
  NeighborhoodComparePoster,
  RatingGapStrip,
} from "@/components/presentation/controlled/DiagnosisVisuals";
import { NeighborhoodContextSlot } from "@/components/field-read/NeighborhoodContextSlot";
import { parseScoutRating, parseScoutReviewCount } from "@/lib/field/gapDiagnosis";
import { ReportSection } from "@/components/health/report/ReportSection";
import { BriefListenForList } from "@/components/brief/BriefListenForList";
import { BriefFirstBeatBlock } from "@/components/brief/BriefFirstBeatBlock";
import type { OpeningMode } from "@/types/presentationPack";
import { cn } from "@/lib/utils/cn";

const RISK_CONFIG: Record<RiskBand, { label: string; chip: string }> = {
  high: { label: "High floor pressure", chip: "border-red-500/35 bg-red-950/50 text-red-100" },
  medium: { label: "Mixed floor", chip: "border-amber-500/35 bg-amber-950/40 text-amber-100" },
  low: { label: "Open window", chip: "border-teal-500/35 bg-teal-950/40 text-teal-100" },
};

function splitApproachTiming(raw: string): { first90: string; avoid?: string } {
  const trimmed = raw.trim();
  const re = /\bAvoid leading with:\s*/i;
  const match = trimmed.match(re);
  if (!match || match.index === undefined) {
    return { first90: trimmed.replace(/^First 90s:\s*/i, "").trim() || trimmed };
  }
  const head = trimmed.slice(0, match.index).replace(/^First 90s:\s*/i, "").trim();
  const tail = trimmed.slice(match.index + match[0].length).trim();
  if (!head && tail) return { first90: "", avoid: tail };
  return { first90: head || trimmed, avoid: tail || undefined };
}

const TABLET: Record<TabletGuidance, { label: string; hint: string }> = {
  now: {
    label: "Show the tablet early",
    hint: "Quick visual while you have attention — one proof, then back to them.",
  },
  later: {
    label: "Hold the tablet",
    hint: "Clarify how leads are handled first, then bring the screen in.",
  },
  either: {
    label: "Read the room",
    hint: "Rushed + visual → tight pass. Skeptical → stay verbal.",
  },
};

const CHANNEL: Record<ChannelMode, { label: string; hint: string }> = {
  "phone-first": {
    label: "Phone-first",
    hint: "Callbacks matter — lock a clean verbal next step before you leave.",
  },
  "verbal-first": {
    label: "Verbal-first",
    hint: "Face-to-face and specific; device supports, doesn’t open.",
  },
  "tablet-first": {
    label: "Tablet now",
    hint: "Short, relevant walkthrough tied to their lead path.",
  },
};

function CoachingRow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/35 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-400/85">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-white/85">{children}</div>
    </div>
  );
}

type PreCallBriefPanelProps = {
  intel: PreCallIntel;
  painExtras: PainBriefExtras | null;
  neighborhoodContext: NeighborhoodComparisonState;
  gapDiagnosis: GapDiagnosis | null;
  businessProfile: BusinessProfile | null;
  onContinue: () => void;
  openingMode: OpeningMode;
};

export function PreCallBriefPanel({
  intel,
  painExtras,
  neighborhoodContext,
  gapDiagnosis,
  businessProfile,
  onContinue,
  openingMode,
}: PreCallBriefPanelProps) {
  const risk = RISK_CONFIG[intel.riskBand] ?? RISK_CONFIG.medium;
  const tablet = TABLET[intel.tabletGuidance] ?? TABLET.either;
  const channel = CHANNEL[intel.channelMode] ?? CHANNEL["verbal-first"];
  const { first90, avoid } = splitApproachTiming(intel.approachTiming);

  const anchorFirst = intel.keyOpportunities[0];
  const backupAngles = intel.keyOpportunities.slice(1);
  const neighborPoster = neighborhoodPosterPayload(neighborhoodContext);
  const showNeighbor = neighborhoodContext.status === "loading" || neighborPoster != null;

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink-border bg-ink-900 px-4 py-3 sm:px-5">
        <span className={cn("rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide", risk.chip)}>
          {risk.label}
        </span>
        {intel.missedValueEstimate?.trim() ? (
          <p className="min-w-0 flex-1 text-xs font-medium leading-snug text-white/70 sm:text-sm">
            {intel.missedValueEstimate.trim()}
          </p>
        ) : (
          <p className="text-xs text-white/45">Leakage line not generated — scout signals still drive the proof run.</p>
        )}
      </div>

      {painExtras ? (
        <>
          <ReportSection kicker="Primary angle" title={painExtras.primaryPainHeadline?.trim() || "How you enter"}>
            <p className="text-base font-semibold leading-snug text-white sm:text-lg">{painExtras.openingStatement}</p>
          </ReportSection>

          <ReportSection kicker="Opening question" title="Ask this first">
            <p className="text-lg font-bold leading-snug text-teal-100 sm:text-xl">
              &ldquo;{painExtras.openingQuestion}&rdquo;
            </p>
          </ReportSection>

          <ReportSection kicker="Follow-up" title="If they lean in">
            <p className="text-sm leading-relaxed text-white/85 sm:text-base">{painExtras.followUpProbe}</p>
          </ReportSection>

          <ReportSection kicker="Listen for" title="Signals in the room">
            <BriefListenForList items={painExtras.listenFor} />
          </ReportSection>

          <BriefFirstBeatBlock mode={openingMode} note={painExtras.firstBeatNote} />
        </>
      ) : (
        <>
          <ReportSection kicker="Primary angle" title="Lead with this">
            <p className="text-lg font-semibold leading-snug text-white sm:text-xl">
              &ldquo;{intel.recommendedAngle}&rdquo;
            </p>
          </ReportSection>

          {anchorFirst ? (
            <ReportSection kicker="Opening probe" title="First follow-up">
              <p className="text-sm leading-relaxed text-white/85 sm:text-base">{anchorFirst}</p>
            </ReportSection>
          ) : (
            <ReportSection kicker="Opening probe" title="First follow-up">
              <p className="text-sm text-white/55">
                No secondary anchor on file — stay on how they handle inbound leads and who owns follow-up.
              </p>
            </ReportSection>
          )}

          <BriefFirstBeatBlock mode={openingMode} />
        </>
      )}

      {gapDiagnosis ? (
        <ReportSection kicker="Scout snapshot" title="Numbers at a glance">
          <div className={cn("grid gap-3", showNeighbor ? "sm:grid-cols-2" : "grid-cols-1")}>
            <LeakageBarPoster monthlyLeakage={gapDiagnosis.estimatedMonthlyLeakage} className="border-white/10" />
            {showNeighbor ? (
              neighborPoster ? (
                <NeighborhoodComparePoster data={neighborPoster} className="border-white/10" />
              ) : (
                <NeighborhoodContextSlot context={neighborhoodContext} posterClassName="border-white/10" />
              )
            ) : null}
          </div>
          {businessProfile ? (
            <div className="mt-3">
              <RatingGapStrip
                rating={parseScoutRating(businessProfile.rating)}
                reviewCount={parseScoutReviewCount(businessProfile.reviewCount)}
                className="border-white/10"
              />
            </div>
          ) : null}
        </ReportSection>
      ) : null}

      {avoid ? (
        <ReportSection kicker="Guardrail" title="Don’t open with this">
          <p className="text-sm leading-relaxed text-amber-100/95 sm:text-base">{avoid}</p>
        </ReportSection>
      ) : null}

      <div className="space-y-2.5 pt-1">
        <button type="button" onClick={onContinue} className="btn-primary">
          Start Proof Run
        </button>
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.12em] text-white/40">
          Step 3 · Buyer-facing run
        </p>
      </div>

      <details className="group rounded-2xl border border-dashed border-white/15 bg-black/25 open:border-white/25">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-semibold text-white/90 [&::-webkit-details-marker]:hidden">
          <span>More coaching</span>
          <span aria-hidden className="text-white/45 transition-transform group-open:rotate-180">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </summary>
        <div className="space-y-3 border-t border-white/10 px-4 py-4">
          {first90 ? <CoachingRow title="First 90s cadence">{first90}</CoachingRow> : null}
          <CoachingRow title="If they stall">{intel.likelyObjection}</CoachingRow>
          <CoachingRow title="Pain to name">{intel.painPattern}</CoachingRow>
          <CoachingRow title="When to show the device">
            <>
              <span className="font-semibold text-white">{tablet.label}</span>
              <span className="mt-1 block text-white/60">{tablet.hint}</span>
            </>
          </CoachingRow>
          <CoachingRow title="Channel bias">
            <>
              <span className="font-semibold text-white">{channel.label}</span>
              <span className="mt-1 block text-white/60">{channel.hint}</span>
            </>
          </CoachingRow>
          {backupAngles.length > 0 ? (
            <div className="rounded-xl border border-white/[0.08] bg-black/35 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-400/85">Backup angles</p>
              <ul className="mt-3 space-y-2.5">
                {backupAngles.map((opp, i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/85">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-200">
                      {i + 2}
                    </span>
                    <span className="leading-snug">{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </details>
    </div>
  );
}
