"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Axiom Field] Unhandled render error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Axiom Field
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="max-w-sm text-sm text-muted">
          {error.message || "An unexpected error occurred. Try resetting or returning home."}
        </p>
        {error.digest && (
          <p className="text-xs text-muted opacity-60">Error ID: {error.digest}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-foreground"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
