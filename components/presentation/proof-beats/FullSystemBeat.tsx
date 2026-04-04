"use client";

import { useMemo } from "react";
import type { PresentationSlide } from "@/lib/flows/presentationEngine";
import { ProofRunSystemCapabilityRow } from "@/components/presentation/proof-beats/ProofRunSystemCapabilityRow";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";

const DEFAULT_CAPS = [
  "Missed leads get an instant text-back path",
  "Self-serve booking while you’re on the floor",
  "Review prompts after jobs close the loop",
  "Google profile stays aligned with how you win locally",
] as const;

/**
 * Beat 4 — Full System (`impact-stat`). Uses session intel + slide copy only; no diagnosis recompute.
 */
export function FullSystemBeat({
  slide,
  tone = "default",
}: {
  slide: Extract<PresentationSlide, { type: "impact-stat" }>;
  tone?: "default" | "dani";
}) {
  const dani = tone === "dani";
  const business = useSessionStore((s) => s.session?.business);
  const intel = useSessionStore((s) => s.session?.preCallIntel);

  const name = business?.name?.trim() ?? "";
  const typeLabel = business?.type?.trim() ?? "";

  const capabilityLines = useMemo(() => {
    const ko = intel?.keyOpportunities;
    const arr = Array.isArray(ko) ? ko.map((s) => String(s).trim()).filter(Boolean) : [];
    const merged = [...arr, ...DEFAULT_CAPS];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const line of merged) {
      if (out.length >= 4) break;
      if (seen.has(line)) continue;
      seen.add(line);
      out.push(line);
    }
    return out;
  }, [intel?.keyOpportunities]);

  const headline = name ? `How ${name} runs with the full system` : "The full operating picture";
  const sub =
    typeLabel.length > 0
      ? `${typeLabel} — response, booking, and reputation working in the background.`
      : "Response, booking, and reputation working in the background — not another dashboard to babysit.";

  const titleSize = dani ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl";
  const statSize = dani ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl";

  return (
    <div className={cn("space-y-4", dani && "space-y-5")}>
      <div
        className={cn(
          "rounded-2xl border border-ink-border bg-ink-900 px-4 py-4 text-white shadow-[0_12px_40px_rgb(0_0_0/0.2)] sm:px-5 sm:py-5"
        )}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/90">Full system</p>
        <h3 className={cn("mt-2 font-bold tracking-tight text-white", titleSize)}>{headline}</h3>
        <p className={cn("mt-2 text-white/55", dani ? "text-sm sm:text-base" : "text-xs sm:text-sm")}>{sub}</p>

        <div className="mt-5 rounded-xl border border-teal-500/20 bg-black/40 px-4 py-4 text-center sm:text-left">
          <p className={cn("font-black tabular-nums tracking-tight text-teal-200", statSize)}>{slide.stat}</p>
          <p className={cn("mt-2 font-medium text-white/65", dani ? "text-sm" : "text-xs")}>{slide.statSub}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-border bg-ink-950 px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/90">Running in the background</p>
        <ul className="mt-3 space-y-2.5">
          {capabilityLines.map((line) => (
            <li key={line}>
              <ProofRunSystemCapabilityRow title={line} />
            </li>
          ))}
        </ul>
      </div>

      {intel?.painPattern?.trim() ? (
        <p className="rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3 text-sm leading-snug text-white/70">
          <span className="font-semibold text-white/90">Reality check: </span>
          {intel.painPattern.trim()}
        </p>
      ) : null}

      <div className="rounded-2xl border border-teal-500/25 bg-ink-900/90 px-4 py-4 sm:px-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/90">Takeaway</p>
        <p className={cn("mt-2 font-semibold leading-snug text-white", dani ? "text-base sm:text-lg" : "text-sm")}>
          {slide.takeaway}
        </p>
      </div>
    </div>
  );
}
