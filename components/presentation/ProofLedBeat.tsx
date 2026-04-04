"use client";

import type { PresentationSlide } from "@/lib/flows/presentationEngine";
import {
  resolvePresentationVisualPattern,
  type PresentationVisualPattern,
} from "@/lib/presentation/assets";
import { MerchantProofVisual } from "@/components/presentation/merchant/MerchantProofVisuals";
import { LeakageBarPoster } from "@/components/presentation/controlled/DiagnosisVisuals";
import { PainMirrorBeat } from "@/components/presentation/proof-beats/PainMirrorBeat";
import { ProofRunPhoneSequence } from "@/components/presentation/proof-beats/ProofRunPhoneSequence";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";

function PatternResponseGrid({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 gap-2 sm:gap-3", className)} aria-hidden>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            "aspect-[4/3] rounded-lg border border-border/60 bg-gradient-to-br from-accent/15 to-card shadow-inner",
            i === 2 && "ring-2 ring-accent/50"
          )}
        />
      ))}
    </div>
  );
}

function PatternFlowThree({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-stretch", className)} aria-hidden>
      {["Inbox", "Respond", "Book"].map((label, i) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-border/70 bg-card/50 px-3 py-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">{`0${i + 1}`}</span>
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <div className="h-2 w-full rounded-full bg-border/80">
            <div className="h-2 rounded-full bg-accent/70" style={{ width: `${58 + i * 12}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PatternSplitCompare({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)} aria-hidden>
      <div className="space-y-2 rounded-xl border border-signal-red/25 bg-signal-red/[0.04] p-4">
        <div className="h-2 w-2/3 rounded bg-border" />
        <div className="h-2 w-full rounded bg-border/70" />
        <div className="h-2 w-5/6 rounded bg-border/70" />
      </div>
      <div className="space-y-2 rounded-xl border border-signal-green/30 bg-signal-green/[0.06] p-4">
        <div className="h-2 w-full rounded bg-accent/40" />
        <div className="h-2 w-full rounded bg-accent/25" />
        <div className="h-2 rounded bg-accent/35" style={{ width: "80%" }} />
      </div>
    </div>
  );
}

function PatternStatHero({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-[10rem] flex-col items-center justify-center rounded-2xl border border-accent/30 bg-accent/[0.07] px-6 py-10",
        className
      )}
      aria-hidden
    >
      <div className="text-5xl font-black tabular-nums tracking-tight text-accent sm:text-6xl">↑</div>
      <p className="mt-3 max-w-xs text-center text-xs font-medium uppercase tracking-wider text-muted">Directional lift</p>
    </div>
  );
}

function PatternPipelineStrip({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-end gap-1.5 sm:gap-2", className)} aria-hidden>
      {[40, 55, 35, 70, 85, 60].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md bg-gradient-to-t from-accent/50 to-accent/15"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

function VisualFrame({
  pattern,
  className,
}: {
  pattern: PresentationVisualPattern;
  className?: string;
}) {
  switch (pattern) {
    case "response-grid":
      return <PatternResponseGrid className={className} />;
    case "flow-three":
      return <PatternFlowThree className={className} />;
    case "split-compare":
      return <PatternSplitCompare className={className} />;
    case "stat-hero":
      return <PatternStatHero className={className} />;
    case "pipeline-strip":
      return <PatternPipelineStrip className={className} />;
    default:
      return <PatternResponseGrid className={className} />;
  }
}

type ProofLedBeatProps = {
  slide: Extract<
    PresentationSlide,
    | { type: "proof-snapshot" }
    | { type: "mock-flow" }
    | { type: "comparison-proof" }
    | { type: "impact-stat" }
    | { type: "decision-next" }
  >;
  tone?: "default" | "dani";
};

export function ProofLedBeat({ slide, tone = "default" }: ProofLedBeatProps) {
  const dani = tone === "dani";
  const businessName = useSessionStore((s) => s.session?.business?.name);
  const businessType = useSessionStore((s) => s.session?.business?.type?.trim() ?? "");
  const gapDiagnosis = useSessionStore((s) => s.session?.gapDiagnosis);
  const missedValueLine = useSessionStore((s) => s.session?.preCallIntel?.missedValueEstimate ?? null);
  const statContextLine = businessType ? `How ${businessType} owners usually describe the leak` : undefined;

  const mv = "merchantVisual" in slide ? slide.merchantVisual : undefined;
  const merchantProps = {
    businessLabel: businessName ?? undefined,
    contextLine: statContextLine,
  };

  if (slide.type === "proof-snapshot") {
    const pattern = resolvePresentationVisualPattern(slide.assetKey);
    return (
      <div className={cn("space-y-5", dani && "space-y-6")}>
        <PainMirrorBeat slide={slide} tone={dani ? "dani" : "default"} />
        {mv ? (
          <div className={cn("overflow-hidden rounded-2xl border border-ink-border bg-ink-900/40 p-2 sm:p-3")}>
            <MerchantProofVisual surface={mv} {...merchantProps} />
          </div>
        ) : (
          <VisualFrame pattern={pattern} className="opacity-90" />
        )}
      </div>
    );
  }

  if (slide.type === "mock-flow") {
    const pattern = slide.assetKey ? resolvePresentationVisualPattern(slide.assetKey) : "flow-three";
    return (
      <div className={cn("space-y-5", dani && "space-y-6")}>
        <ProofRunPhoneSequence
          key={slide.id}
          variant="fix"
          businessName={businessName}
          gapDiagnosis={gapDiagnosis}
          className="sm:max-w-[340px]"
        />
        {mv ? (
          <MerchantProofVisual surface={mv} {...merchantProps} />
        ) : (
          <VisualFrame pattern={pattern} />
        )}
        {!dani ? (
          <ol className="space-y-2.5">
            {slide.steps.slice(0, 4).map((s) => (
              <li
                key={s.id}
                className="flex min-h-12 gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-sm font-bold text-teal-700 dark:text-teal-200">
                  {s.id}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{s.label}</p>
                  {s.hint ? <p className="text-xs text-muted">{s.hint}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        ) : null}
        <p
          className={cn(
            "rounded-xl border border-teal-500/20 bg-teal-950/20 px-4 py-3 font-medium text-foreground",
            dani ? "text-base sm:text-lg" : "text-sm"
          )}
        >
          {slide.takeaway}
        </p>
      </div>
    );
  }

  if (slide.type === "comparison-proof") {
    const pattern = slide.assetKey ? resolvePresentationVisualPattern(slide.assetKey) : "split-compare";
    return (
      <div className={cn("space-y-5", dani && "space-y-6")}>
        <ProofRunPhoneSequence
          key={slide.id}
          variant="missed"
          businessName={businessName}
          gapDiagnosis={gapDiagnosis}
          missedValueLine={missedValueLine}
          className="sm:max-w-[340px]"
        />
        {mv ? (
          <MerchantProofVisual surface={mv} {...merchantProps} />
        ) : (
          <VisualFrame pattern={pattern} />
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-4 dark:bg-red-950/30">
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-200/90">Before</p>
            <p className="mt-1 font-semibold text-foreground">{slide.before.headline}</p>
            <p className="mt-2 text-sm leading-snug text-muted">{slide.before.detail}</p>
          </div>
          <div className="rounded-xl border border-teal-500/25 bg-teal-950/15 p-4 dark:bg-teal-950/25">
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-300">After</p>
            <p className="mt-1 font-semibold text-foreground">{slide.after.headline}</p>
            <p className="mt-2 text-sm leading-snug text-muted">{slide.after.detail}</p>
          </div>
        </div>
        <p
          className={cn(
            "rounded-xl border border-border/50 bg-card/30 px-4 py-3 font-medium text-foreground/95",
            dani ? "text-base sm:text-lg" : "text-sm"
          )}
        >
          {slide.takeaway}
        </p>
      </div>
    );
  }

  if (slide.type === "impact-stat") {
    if (mv) {
      return (
        <div className={cn("space-y-5", dani && "space-y-6")}>
          <div
            className={cn(
              "grid gap-4",
              dani && gapDiagnosis ? "sm:grid-cols-2 sm:items-stretch" : "sm:grid-cols-1"
            )}
          >
            <MerchantProofVisual surface={mv} statText={slide.stat} {...merchantProps} />
            {dani && gapDiagnosis ? (
              <LeakageBarPoster monthlyLeakage={gapDiagnosis.estimatedMonthlyLeakage} className="h-full" />
            ) : null}
          </div>
          <p className="text-center text-sm font-medium text-muted sm:text-left">{slide.statSub}</p>
          <p className={cn("rounded-lg border border-border/50 bg-card/30 px-4 py-3 text-sm font-medium text-foreground", dani && "text-base")}>
            {slide.takeaway}
          </p>
        </div>
      );
    }
    const pattern = slide.assetKey ? resolvePresentationVisualPattern(slide.assetKey) : "stat-hero";
    return (
      <div className={cn("space-y-5", dani && "space-y-6")}>
        <div className="grid gap-4 sm:grid-cols-2 sm:items-center">
          <VisualFrame pattern={pattern} />
          <div className="text-center sm:text-left">
            <p className="text-4xl font-black tabular-nums tracking-tight text-accent sm:text-5xl">{slide.stat}</p>
            <p className="mt-2 text-sm font-medium text-muted">{slide.statSub}</p>
          </div>
        </div>
        <p className={cn("rounded-lg border border-border/50 bg-card/30 px-4 py-3 text-sm font-medium text-foreground", dani && "text-base")}>
          {slide.takeaway}
        </p>
      </div>
    );
  }

  if (slide.type === "decision-next") {
    const featureCards = [
      "Missed-call auto text-back",
      "24/7 online booking",
      "Automated review requests",
      "Google profile optimization",
    ];
    if (mv) {
      return (
        <div className={cn("space-y-4", dani && "space-y-5")}>
          <MerchantProofVisual surface={mv} {...merchantProps} />
          {dani ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {featureCards.map((label) => (
                <div
                  key={label}
                  className="rounded-xl border-l-4 border-teal-500 bg-[#1a1a1a]/90 px-4 py-3 text-sm font-medium text-white shadow-inner"
                >
                  {label}
                </div>
              ))}
            </div>
          ) : null}
          <div className={cn("space-y-4 rounded-xl border border-border/60 bg-card/35 px-5 py-6", dani && "space-y-5 py-8")}>
            <p className={cn("text-lg font-semibold text-foreground", dani && "text-xl sm:text-2xl")}>{slide.bridge}</p>
            <p className="text-sm font-medium text-accent">{slide.takeaway}</p>
          </div>
        </div>
      );
    }
    return (
      <div className={cn("space-y-4", dani && "space-y-5")}>
        {dani ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {featureCards.map((label) => (
              <div
                key={label}
                className="rounded-xl border-l-4 border-teal-500 bg-[#1a1a1a]/90 px-4 py-3 text-sm font-medium text-white shadow-inner"
              >
                {label}
              </div>
            ))}
          </div>
        ) : null}
        <div className={cn("space-y-4 rounded-xl border border-border/60 bg-card/35 px-5 py-6", dani && "space-y-5 py-8")}>
          <p className={cn("text-lg font-semibold text-foreground", dani && "text-xl sm:text-2xl")}>{slide.bridge}</p>
          <p className="text-sm font-medium text-accent">{slide.takeaway}</p>
        </div>
      </div>
    );
  }

  return null;
}
