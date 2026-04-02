"use client";

import type { ReactNode } from "react";
import { AxiomFieldLogo } from "@/components/branding/AxiomFieldLogo";

export function AppShellV2({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_40%,#f1f5f9_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(37,99,235,0.11),transparent)]"
        aria-hidden
      />

      <div className="relative z-10 p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-surface/95 px-5 py-3.5 shadow-soft backdrop-blur-md ring-1 ring-slate-900/[0.04]">
          <AxiomFieldLogo />

          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Rep mode
          </div>
        </div>

        <div className="min-h-[80vh] rounded-3xl border border-border bg-surface p-6 shadow-soft ring-1 ring-slate-900/[0.04] md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
