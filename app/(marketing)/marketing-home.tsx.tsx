import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";

export default function MarketingPage() {
  return (
    <AppShell>
      <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-16">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm uppercase tracking-[0.25em] text-accent">
            Axiom Flow
          </p>

          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Show what's being missed. Prove the value. Move to the close.
          </h1>

          <p className="max-w-2xl text-lg text-muted">
            A tablet-first guided selling engine with public proof for the buyer
            and private coaching for the rep.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-black"
            >
              Open App
            </Link>

            <Link
              href="/session/demo-session"
              className="rounded-xl border border-border px-5 py-3 text-sm font-medium"
            >
              View Demo Session
            </Link>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
