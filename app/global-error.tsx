"use client";

import { Inter } from "next/font/google";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

/**
 * Root error boundary — must define html/body (separate from root layout).
 * Catches errors in the root layout or when the root layout cannot render.
 *
 * Imports globals.css + font here: this tree does NOT inherit `app/layout.tsx`,
 * so without them the page renders as unstyled HTML.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} app-root min-h-screen font-sans text-foreground antialiased`}
      >
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Axiom Field</p>
          <h1 className="text-xl font-semibold">Application error</h1>
          <p className="max-w-md text-sm text-muted">{error.message || "Something went wrong."}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={reset}
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
            <a
              href="/"
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted"
            >
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
