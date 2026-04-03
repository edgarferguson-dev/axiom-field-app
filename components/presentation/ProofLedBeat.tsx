"use client";

import type { PresentationSlide } from "@/lib/flows/presentationEngine";
import {
  resolvePresentationVisualPattern,
  type PresentationVisualPattern,
} from "@/lib/presentation/assets";
import { MerchantProofVisual } from "@/components/presentation/merchant/MerchantProofVisuals";
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
  const statContextLine = businessType ? `How ${businessType} owners usually describe the leak` : undefined;

  const mv = "merchantVisual" in slide ? slide.merchantVisual : undefined;
  const merchantProps = {
    businessLabel: businessName ?? undefined,
    contextLine: statContextLine,
  };

  if (slide.type === "proof-snapshot") {
    if (mv) {
      return (
        <div className={cn("space-y-5", dani && "space-y-6")}>
          <MerchantProofVisual surface={mv} {...merchantProps} />
          <div className="rounded-xl border border-accent/20 bg-accent/[0.05] px-4 py-3 sm:px-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Takeaway</p>
            <p className={cn("mt-1.5 font-medium text-foreground", dani ? "text-lg sm:text-xl" : "text-sm sm:text-base")}>
              {slide.takeaway}
            </p>
            <p className="mt-2 text-xs text-muted">{slide.proofLabel}</p>
          </div>
        </div>
      );
    }
    const pattern = resolvePresentationVisualPattern(slide.assetKey);
    return (
      <div className={cn("space-y-5", dani && "space-y-6")}>
        <VisualFrame pattern={pattern} />
        <div className="rounded-xl border border-accent/20 bg-accent/[0.05] px-4 py-3 sm:px-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Takeaway</p>
          <p className={cn("mt-1.5 font-medium text-foreground", dani ? "text-lg sm:text-xl" : "text-sm sm:text-base")}>
            {slide.takeaway}
          </p>
          <p className="mt-2 text-xs text-muted">{slide.proofLabel}</p>
        </div>
      </div>
    );
  }

  if (slide.type === "mock-flow") {
    if (mv) {
      return (
        <div className={cn("space-y-5", dani && "space-y-6")}>
          <MerchantProofVisual surface={mv} {...merchantProps} />
          <ol className="space-y-3">
            {slide.steps.map((s) => (
              <li key={s.id} className="flex gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
                  {s.id}
                </span>
                <div>
                  <p className="font-semibold text-foreground">{s.label}</p>
                  {s.hint ? <p className="text-xs text-muted">{s.hint}</p> : null}
                </div>
              </li>
            ))}
          </ol>
          <p className={cn("text-sm font-medium text-foreground/90", dani && "text-base")}>{slide.takeaway}</p>
        </div>
      );
    }
    const pattern = slide.assetKey ? resolvePresentationVisualPattern(slide.assetKey) : "flow-three";
    return (
      <div className={cn("space-y-5", dani && "space-y-6")}>
        <VisualFrame pattern={pattern} />
        <ol className="space-y-3">
          {slide.steps.map((s) => (
            <li key={s.id} className="flex gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
                {s.id}
              </span>
              <div>
                <p className="font-semibold text-foreground">{s.label}</p>
                {s.hint ? <p className="text-xs text-muted">{s.hint}</p> : null}
              </div>
            </li>
          ))}
        </ol>
        <p className={cn("text-sm font-medium text-foreground/90", dani && "text-base")}>{slide.takeaway}</p>
      </div>
    );
  }

  if (slide.type === "comparison-proof") {
    if (mv) {
      return (
        <div className={cn("space-y-5", dani && "space-y-6")}>
          <MerchantProofVisual surface={mv} {...merchantProps} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background/50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Before</p>
              <p className="mt-1 font-semibold text-foreground">{slide.before.headline}</p>
              <p className="mt-2 text-sm text-muted">{slide.before.detail}</p>
            </div>
            <div className="rounded-xl border border-accent/25 bg-accent/[0.06] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-accent">After</p>
              <p className="mt-1 font-semibold text-foreground">{slide.after.headline}</p>
              <p className="mt-2 text-sm text-muted">{slide.after.detail}</p>
            </div>
          </div>
          <p className={cn("text-sm font-medium text-foreground/90", dani && "text-base")}>{slide.takeaway}</p>
        </div>
      );
    }
    const pattern = slide.assetKey ? resolvePresentationVisualPattern(slide.assetKey) : "split-compare";
    return (
      <div className={cn("space-y-5", dani && "space-y-6")}>
        <VisualFrame pattern={pattern} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-background/50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Before</p>
            <p className="mt-1 font-semibold text-foreground">{slide.before.headline}</p>
            <p className="mt-2 text-sm text-muted">{slide.before.detail}</p>
          </div>
          <div className="rounded-xl border border-accent/25 bg-accent/[0.06] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-accent">After</p>
            <p className="mt-1 font-semibold text-foreground">{slide.after.headline}</p>
            <p className="mt-2 text-sm text-muted">{slide.after.detail}</p>
          </div>
        </div>
        <p className={cn("text-sm font-medium text-foreground/90", dani && "text-base")}>{slide.takeaway}</p>
      </div>
    );
  }

  if (slide.type === "impact-stat") {
    if (mv) {
      return (
        <div className={cn("space-y-5", dani && "space-y-6")}>
          <MerchantProofVisual surface={mv} statText={slide.stat} {...merchantProps} />
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
    if (mv) {
      return (
        <div className={cn("space-y-4", dani && "space-y-5")}>
          <MerchantProofVisual surface={mv} {...merchantProps} />
          <div className={cn("space-y-4 rounded-xl border border-border/60 bg-card/35 px-5 py-6", dani && "space-y-5 py-8")}>
            <p className={cn("text-lg font-semibold text-foreground", dani && "text-xl sm:text-2xl")}>{slide.bridge}</p>
            <p className="text-sm font-medium text-accent">{slide.takeaway}</p>
          </div>
        </div>
      );
    }
    return (
      <div className={cn("space-y-4 rounded-xl border border-border/60 bg-card/35 px-5 py-6", dani && "space-y-5 py-8")}>
        <p className={cn("text-lg font-semibold text-foreground", dani && "text-xl sm:text-2xl")}>{slide.bridge}</p>
        <p className="text-sm font-medium text-accent">{slide.takeaway}</p>
      </div>
    );
  }

  return null;
}
