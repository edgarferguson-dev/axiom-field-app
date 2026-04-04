"use client";

import type { OpeningMode } from "@/types/presentationPack";
import { ReportSection } from "@/components/health/report/ReportSection";
import { briefOpeningModeHint, briefOpeningModeTitle } from "@/components/brief/briefOpeningModeCopy";

export function BriefFirstBeatBlock({
  mode,
  note,
}: {
  mode: OpeningMode;
  note?: string | null;
}) {
  return (
    <ReportSection kicker="Proof run" title={briefOpeningModeTitle(mode)} variant="emphasis">
      <p className="text-sm leading-relaxed text-white/80">{briefOpeningModeHint(mode)}</p>
      {note?.trim() ? (
        <p className="mt-3 rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm leading-snug text-white/85">
          {note.trim()}
        </p>
      ) : null}
    </ReportSection>
  );
}
