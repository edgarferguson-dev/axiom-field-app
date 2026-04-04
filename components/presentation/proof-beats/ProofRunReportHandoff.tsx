"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useParams } from "next/navigation";
import { useSessionStore } from "@/store/session-store";
import { resolveActiveOfferTemplate } from "@/lib/presentation/resolveActiveOfferTemplate";
import { cn } from "@/lib/utils/cn";

/**
 * Beat 6 — Health report handoff: preview, share, optional SMS to owner. Uses session store only.
 */
export function ProofRunReportHandoff({ tone = "default" }: { tone?: "default" | "dani" }) {
  const params = useParams();
  const sessionId = typeof params?.sessionId === "string" ? params.sessionId : "";
  const session = useSessionStore((s) => s.session);
  const offerTemplates = useSessionStore((s) => s.offerTemplates);
  const defaultOfferTemplateId = useSessionStore((s) => s.defaultOfferTemplateId);
  const proofRunDispatch = useSessionStore((s) => s.proofRunDispatch);

  const dani = tone === "dani";
  const business = session?.business;
  const gaps = session?.gapDiagnosis;

  const reportUrl =
    typeof window !== "undefined" && sessionId
      ? `${window.location.origin}/session/${sessionId}/health-report`
      : sessionId
        ? `/session/${sessionId}/health-report`
        : "";

  const offer = resolveActiveOfferTemplate({
    offerTemplates,
    defaultOfferTemplateId,
    session: session ?? null,
  });

  const ownerPhone = business?.contactPhone?.replace(/\D/g, "") ?? "";
  const canTextOwner = ownerPhone.length >= 10;

  const shareReport = useCallback(async () => {
    if (!sessionId || !business) return;
    const url =
      typeof window !== "undefined" ? `${window.location.origin}/session/${sessionId}/health-report` : reportUrl;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Health report — ${business.name}`,
          text: `Business health report for ${business.name}`,
          url,
        });
        proofRunDispatch({ type: "mark-report-shared" });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        proofRunDispatch({ type: "mark-report-shared" });
        window.alert("Link copied — send it however works for them.");
      }
    } catch {
      /* cancelled */
    }
  }, [sessionId, business, reportUrl, proofRunDispatch]);

  const textToOwner = useCallback(() => {
    if (!sessionId || !business || !canTextOwner) return;
    const url =
      typeof window !== "undefined" ? `${window.location.origin}/session/${sessionId}/health-report` : reportUrl;
    const message = encodeURIComponent(
      `Hey — I put together a quick business health report for ${business.name}. Here's the link when you have a minute: ${url}`
    );
    proofRunDispatch({ type: "mark-report-texted" });
    window.open(`sms:${ownerPhone}?body=${message}`, "_blank", "noopener,noreferrer");
  }, [sessionId, business, canTextOwner, ownerPhone, reportUrl, proofRunDispatch]);

  if (!sessionId) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border/60 bg-card/40 px-4 py-6 text-center text-sm text-muted",
          dani && "border-white/10 bg-ink-900 text-white/75"
        )}
      >
        Open this run from a session to share the health report.
      </div>
    );
  }

  if (!business || !gaps) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border/60 bg-card/40 px-4 py-6 text-center text-sm text-muted",
          dani && "border-white/10 bg-ink-900 text-white/75"
        )}
      >
        Finish scout and lock diagnosis — then this handoff activates.
        <div className="mt-4">
          <Link
            href={`/session/${sessionId}/field-read`}
            className={cn("inline-flex min-h-12 items-center justify-center rounded-xl px-4 font-semibold text-accent underline")}
          >
            Open scout
          </Link>
        </div>
      </div>
    );
  }

  const topGap = gaps.gaps[0]?.label ?? "Operational gaps from your scout";

  return (
    <div className={cn("space-y-4", dani && "space-y-5")}>
      <div
        className={cn(
          "rounded-2xl border border-ink-border bg-ink-900 px-4 py-4 text-white shadow-[0_12px_40px_rgb(0_0_0/0.2)] sm:px-5 sm:py-5",
          dani && "border-teal-500/20"
        )}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/90">Leave-behind</p>
        <h3 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">{business.name}</h3>
        <p className="mt-2 text-sm leading-snug text-white/65">
          One-page health report — same diagnosis as this run — so they can revisit it after you leave.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-ink-950 px-4 py-4 sm:px-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/85">Preview</p>
        <div className="mt-3 space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Top signal</p>
            <p className="mt-1 text-base font-semibold text-white">{topGap}</p>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-2 border-t border-white/10 pt-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Directional leak</p>
              <p className="text-lg font-black tabular-nums text-teal-200">
                ~${gaps.estimatedMonthlyLeakage.toLocaleString()}
                <span className="text-sm font-semibold text-white/50">/mo</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-white/40">Pilot anchor</p>
              <p className="text-sm font-bold text-white">${offer.monthlyFee}/mo</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-white/50">
            Full layout includes reputation strip, gaps, and rep contact — same artifact as the dedicated report page.
          </p>
        </div>
        <div className="mt-4">
          <Link
            href={`/session/${sessionId}/health-report`}
            className={cn(
              "inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-teal-500/40 bg-teal-950/40 text-sm font-bold text-teal-100 transition hover:border-teal-400/60 hover:bg-teal-950/60 sm:w-auto sm:px-6"
            )}
          >
            Open full report
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => void shareReport()}
          className="min-h-12 flex-1 rounded-xl bg-teal-600 px-4 text-sm font-bold text-white shadow-soft transition hover:bg-teal-500 sm:flex-none sm:px-6"
        >
          Share link
        </button>
        {canTextOwner ? (
          <button
            type="button"
            onClick={textToOwner}
            className="min-h-12 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-white/25 sm:flex-none sm:px-6"
          >
            Text link to owner
          </button>
        ) : (
          <div
            className={cn(
              "flex min-h-12 flex-1 items-center rounded-xl border border-white/10 bg-black/30 px-4 text-xs text-white/50 sm:flex-none"
            )}
          >
            Add owner phone on the scout card to enable SMS handoff.
          </div>
        )}
      </div>
    </div>
  );
}
