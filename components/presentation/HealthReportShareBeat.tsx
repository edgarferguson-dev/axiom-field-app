"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSessionStore } from "@/store/session-store";
import { resolveActiveOfferTemplate } from "@/lib/presentation/resolveActiveOfferTemplate";
import { BusinessHealthReport } from "@/components/health/BusinessHealthReport";
import { NEIGHBORHOOD_CONTEXT_IDLE } from "@/types/scoutIntel";
import { cn } from "@/lib/utils/cn";

export function HealthReportShareBeat({ tone = "default" }: { tone?: "default" | "dani" }) {
  const params = useParams();
  const sessionId = typeof params?.sessionId === "string" ? params.sessionId : "";
  const session = useSessionStore((s) => s.session);
  const offerTemplates = useSessionStore((s) => s.offerTemplates);
  const defaultOfferTemplateId = useSessionStore((s) => s.defaultOfferTemplateId);
  const fieldRepCard = useSessionStore((s) => s.fieldRepCard);

  const dani = tone === "dani";
  const business = session?.business;
  const gaps = session?.gapDiagnosis;
  const neighborhoodContext = session?.neighborhoodContext ?? NEIGHBORHOOD_CONTEXT_IDLE;

  if (!sessionId || !business || !gaps) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border/60 bg-card/40 px-4 py-6 text-center text-sm text-muted",
          dani && "border-border/50 bg-[#1a1a1a]/90 text-white/80"
        )}
      >
        Run Scout and lock a brief so gap diagnosis populates — neighborhood stats are optional when Places includes a pin.
        <div className="mt-3">
          <Link href={`/session/${sessionId}/field-read`} className="text-accent underline">
            Open scout
          </Link>
        </div>
      </div>
    );
  }

  const offer = resolveActiveOfferTemplate({
    offerTemplates,
    defaultOfferTemplateId,
    session,
  });

  return (
    <div className={cn("max-h-[min(70vh,520px)] overflow-y-auto rounded-xl pr-1", dani && "max-h-[min(65vh,480px)]")}>
      <BusinessHealthReport
        sessionId={sessionId}
        scoutData={business}
        gapDiagnosis={gaps}
        neighborhoodContext={neighborhoodContext}
        offerData={{ monthlyFee: offer.monthlyFee, label: offer.label }}
        repCard={fieldRepCard}
        showSessionLink={false}
      />
    </div>
  );
}
