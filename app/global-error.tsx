"use client";

import { useEffect } from "react";

/**
 * Catches errors that escape app/error.tsx — including root layout crashes.
 * Must include its own <html>/<body> because it replaces the root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Axiom Field] Global error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body style={{ background: "#07090E", color: "#F1F5F9", fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "1.5rem",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#3B82F6" }}>
              Axiom Field
            </p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#64748B", maxWidth: "28rem", margin: "0 auto" }}>
              {error.message || "An unexpected client-side error occurred."}
            </p>
            {error.digest && (
              <p style={{ fontSize: "0.75rem", color: "#64748B", opacity: 0.6 }}>
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={reset}
              style={{
                background: "#3B82F6",
                color: "#fff",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.625rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                border: "1px solid #1F2A3A",
                background: "#111827",
                color: "#64748B",
                borderRadius: "0.75rem",
                padding: "0.625rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
