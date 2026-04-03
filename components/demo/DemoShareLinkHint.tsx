"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Rep (private) view: same host/port as this tab — copy for a second screen or device.
 * Avoids guessing localhost:3001 vs :3010 etc.
 */
export function DemoShareLinkHint() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(typeof window !== "undefined" ? window.location.href : "");
  }, []);

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!url) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-card/60 px-3 py-2.5 text-left text-xs text-muted shadow-soft">
      <p className="font-medium text-foreground">Buyer screen</p>
      <p className="mt-1 leading-relaxed">
        Same address on a TV or tablet, or switch to <span className="font-semibold text-foreground">Public</span> on this device.
      </p>
      <button
        type="button"
        onClick={copy}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-foreground transition hover:border-accent/40"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-signal-green" aria-hidden />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" aria-hidden />
            Copy page link
          </>
        )}
      </button>
    </div>
  );
}
