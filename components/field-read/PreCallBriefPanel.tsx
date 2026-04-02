"use client";

import type { ReactNode } from "react";
import type { PreCallIntel, RiskBand, TabletGuidance, ChannelMode } from "@/types/session";
import { cn } from "@/lib/utils/cn";

const RISK_CONFIG: Record<RiskBand, { label: string; color: string; bg: string }> = {
  high: {
    label: "High floor pressure",
    color: "text-signal-red",
    bg: "bg-signal-red/10 border-signal-red/30",
  },
  medium: {
    label: "Mixed floor",
    color: "text-signal-yellow",
    bg: "bg-signal-yellow/10 border-signal-yellow/30",
  },
  low: {
    label: "Open window",
    color: "text-signal-green",
    bg: "bg-signal-green/10 border-signal-green/30",
  },
};

/** Prompt asks for: "First 90s: … Avoid leading with: …" — split for UI without new fields */
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
  return {
    first90: head || trimmed,
    avoid: tail || undefined,
  };
}

const TABLET: Record<TabletGuidance, { label: string; hint: string }> = {
  now: {
    label: "Show the tablet early",
    hint: "Quick visual while you have attention—one proof, then back to them.",
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
    hint: "Callbacks matter—lock a clean verbal next step before you leave.",
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

function PrimaryBlock({
  kicker,
  children,
  variant = "default",
}: {
  kicker: string;
  children: ReactNode;
  variant?: "opener" | "avoid" | "default";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-5 sm:p-6",
        variant === "opener" && "border-accent/35 bg-accent/[0.07] shadow-[0_1px_0_0_rgba(15,23,42,0.06)]",
        variant === "avoid" && "border-amber-400/40 bg-amber-50/90",
        variant === "default" && "border-slate-200 bg-card shadow-sm"
      )}
    >
      <p
        className={cn(
          "text-[11px] font-bold uppercase tracking-[0.14em] sm:text-xs",
          variant === "opener" && "text-accent",
            variant === "avoid" && "text-amber-900",
            variant === "default" && "text-slate-600"
        )}
      >
        {kicker}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function SecondaryCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 px-4 py-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {title}
      </p>
      <div className="mt-2 text-sm leading-relaxed text-slate-800">{children}</div>
    </div>
  );
}

type PreCallBriefPanelProps = {
  intel: PreCallIntel;
  onContinue: () => void;
};

export function PreCallBriefPanel({ intel, onContinue }: PreCallBriefPanelProps) {
  const risk = RISK_CONFIG[intel.riskBand] ?? RISK_CONFIG.medium;
  const tablet = TABLET[intel.tabletGuidance] ?? TABLET.either;
  const channel = CHANNEL[intel.channelMode] ?? CHANNEL["verbal-first"];
  const { first90, avoid } = splitApproachTiming(intel.approachTiming);

  const anchorFirst = intel.keyOpportunities[0];
  const backupAngles = intel.keyOpportunities.slice(1);

  return (
    <div className="mx-auto w-full max-w-xl animate-slide-up">
      {/* Context: compact — does not compete with talking points */}
      <div className="mb-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border/80 pb-5">
        <span
          className={cn(
            "inline-flex shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
            risk.bg,
            risk.color
          )}
        >
          {risk.label}
        </span>
        {intel.missedValueEstimate ? (
          <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground">{intel.missedValueEstimate}</p>
        ) : null}
      </div>

      {/* PRIMARY: scan order = opener → anchor → objection → avoid → CTA */}
      <div className="space-y-5">
        <PrimaryBlock kicker="Best opener" variant="opener">
          <p className="text-[1.125rem] font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
            &ldquo;{intel.recommendedAngle}&rdquo;
          </p>
        </PrimaryBlock>

        {anchorFirst ? (
          <PrimaryBlock kicker="Anchor first">
            <p className="text-base font-medium leading-relaxed text-foreground sm:text-[1.0625rem]">{anchorFirst}</p>
          </PrimaryBlock>
        ) : null}

        <PrimaryBlock kicker="Likely objection">
          <p className="text-base font-medium leading-relaxed text-foreground sm:text-[1.0625rem]">{intel.likelyObjection}</p>
        </PrimaryBlock>

        {avoid ? (
          <PrimaryBlock kicker="What not to lead with" variant="avoid">
            <p className="text-base font-medium leading-relaxed text-foreground sm:text-[1.0625rem]">{avoid}</p>
          </PrimaryBlock>
        ) : null}
      </div>

      {/* Dominant CTA — strongest action on screen */}
      <div className="mt-8 space-y-2">
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-2xl bg-accent px-6 py-4 text-base font-bold text-white shadow-[0_4px_14px_-3px_rgba(37,99,235,0.55)] ring-2 ring-accent/25 transition hover:opacity-[0.96] active:scale-[0.99] sm:py-[1.125rem] sm:text-lg"
        >
          Open live demo →
        </button>
        <p className="text-center text-xs text-muted">Proof in the room starts here.</p>
      </div>

      {/* SECONDARY: collapsed by default so it never fights the walk-in lines */}
      <details className="group mt-10 open:pb-1">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-slate-50/90 px-4 py-3.5 text-sm font-semibold text-foreground transition hover:bg-slate-100/90 [&::-webkit-details-marker]:hidden">
          <span>More coaching</span>
          <span
            aria-hidden
            className="text-muted transition-transform duration-200 group-open:rotate-180"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </summary>

        <div className="mt-5 space-y-4 border-t border-border/70 pt-6">
          {first90 ? (
            <SecondaryCard title="Cadence">{first90}</SecondaryCard>
          ) : null}

          <div className="space-y-3">
            <SecondaryCard title="When to show the device">
              <>
                <span className="font-semibold text-foreground">{tablet.label}</span>
                <span className="mt-1 block text-sm text-muted">{tablet.hint}</span>
              </>
            </SecondaryCard>
            <SecondaryCard title="Recommended channel">
              <>
                <span className="font-semibold text-foreground">{channel.label}</span>
                <span className="mt-1 block text-sm text-muted">{channel.hint}</span>
              </>
            </SecondaryCard>
          </div>

          <SecondaryCard title="Pain to name in the room">{intel.painPattern}</SecondaryCard>

          {backupAngles.length > 0 ? (
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 px-4 py-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                If you get airtime
              </p>
              <ul className="mt-3 space-y-3">
                {backupAngles.map((opp, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-snug text-slate-800">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                      {i + 2}
                    </span>
                    <span>{opp}</span>
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
