"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ingestSalesMaterial, type MaterialSummary } from "@/lib/flows/materialEngine";

type UploadSalesMaterialProps = {
  onIngest: (summary: MaterialSummary) => void;
};

export function UploadSalesMaterial({ onIngest }: UploadSalesMaterialProps) {
  const [rawText, setRawText] = useState("");
  const [websiteCopy, setWebsiteCopy] = useState("");
  const [bullets, setBullets] = useState("");
  const [pdfTextPlaceholder, setPdfTextPlaceholder] = useState("");

  const combinedLen = useMemo(
    () => rawText.length + websiteCopy.length + bullets.length + pdfTextPlaceholder.length,
    [rawText, websiteCopy, bullets, pdfTextPlaceholder]
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Sales Material
          </p>
          <p className="mt-1 text-xs text-muted">
            Paste content to generate a cleaner presentation (rep-only).
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted">
          {combinedLen > 0 ? "Ready" : "Empty"}
        </span>
      </div>

      <div className="space-y-3">
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={3}
          placeholder="Raw text (product overview, positioning, etc.)"
          className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition"
        />
        <textarea
          value={bullets}
          onChange={(e) => setBullets(e.target.value)}
          rows={3}
          placeholder="Bullet points (benefits / proof / pricing notes)"
          className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition"
        />
        <textarea
          value={websiteCopy}
          onChange={(e) => setWebsiteCopy(e.target.value)}
          rows={3}
          placeholder="Website copy (paste section text)"
          className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition"
        />
        <textarea
          value={pdfTextPlaceholder}
          onChange={(e) => setPdfTextPlaceholder(e.target.value)}
          rows={2}
          placeholder="Optional: parsed PDF text placeholder (paste text)"
          className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition"
        />

        <div className="flex gap-2">
          <button
            type="button"
            className={cn(
              "flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition",
              "hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            )}
            disabled={combinedLen === 0}
            onClick={() =>
              onIngest(
                ingestSalesMaterial({
                  rawText,
                  bulletPoints: bullets,
                  websiteCopy,
                  pdfTextPlaceholder,
                })
              )
            }
          >
            Ingest → Update Slides
          </button>
          <button
            type="button"
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-foreground"
            onClick={() => {
              setRawText("");
              setWebsiteCopy("");
              setBullets("");
              setPdfTextPlaceholder("");
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

