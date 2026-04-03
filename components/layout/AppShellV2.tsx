"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpen, Home, LogIn, Settings } from "lucide-react";
import { AxiomFieldLogo } from "@/components/branding/AxiomFieldLogo";

export function AppShellV2({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-background" aria-hidden />

      <div className="relative z-10 px-8 py-8 md:px-10 md:py-12">
        <header className="mb-8 flex flex-col gap-3 rounded-xl border border-border bg-surface px-5 py-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
            <AxiomFieldLogo size="md" />
          </Link>

          <nav className="ax-label flex flex-wrap items-center gap-1 font-semibold sm:gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 transition hover:bg-border/40 hover:text-foreground"
            >
              <Home className="h-3.5 w-3.5" aria-hidden />
              Home
            </Link>
            <Link
              href="/materials"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 transition hover:bg-border/40 hover:text-foreground"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              Library
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 transition hover:bg-border/40 hover:text-foreground"
            >
              <Settings className="h-3.5 w-3.5" aria-hidden />
              Settings
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 transition hover:bg-border/40 hover:text-foreground"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden />
              Account
            </Link>
          </nav>
        </header>

        <div className="min-h-[75vh] rounded-xl border border-border bg-surface p-8 shadow-soft ring-1 ring-foreground/[0.03] md:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}
