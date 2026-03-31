"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Topbar } from "@/components/layout/topbar";
import { useSessionStore } from "@/store/session-store";

function generateSessionId(): string {
  return `ax-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AppHomePage() {
  const router = useRouter();
  const initSession = useSessionStore((s) => s.initSession);

  const [repName, setRepName] = useState("");
  const [loading, setLoading] = useState(false);

  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!repName.trim()) return;

    setLoading(true);
    const id = generateSessionId();
    initSession(id, repName.trim());
    router.push(`/session/${id}/field-read`);
  }

  return (
    <AppShell>
      <Topbar title="Axiom Field" subtitle="Sales Execution Platform" status="Ready" />

      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo mark */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-accent/30">
              <svg
                className="h-7 w-7 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Start a Session
            </h1>
            <p className="mt-2 text-sm text-muted">
              Pre-call intel · Live coaching · Performance debrief
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleStart}
            className="rounded-2xl border border-border bg-card p-6 shadow-soft"
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="repName"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Your name
                </label>
                <input
                  id="repName"
                  type="text"
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  placeholder="e.g. Jordan Reeves"
                  required
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !repName.trim()}
                className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Starting…" : "Begin Session →"}
              </button>
            </div>
          </form>

          {/* Flow preview */}
          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-muted">
            <span>Pre-Call Intel</span>
            <span className="text-border">→</span>
            <span>Live Coaching</span>
            <span className="text-border">→</span>
            <span>Performance Score</span>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
