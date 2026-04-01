"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type HomeHeroProps = {
  repName: string;
  onRepNameChange: (value: string) => void;
  onStartSession: (e: React.FormEvent) => void;
  loading: boolean;
  onExplorePlatform: () => void;
};

export function HomeHero({
  repName,
  onRepNameChange,
  onStartSession,
  loading,
  onExplorePlatform,
}: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-surface/40 to-background px-4 pb-16 pt-10 md:pb-20 md:pt-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
      >
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Brand row: logo + title + tagline */}
          <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-center lg:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-accent/30">
              <svg
                className="h-7 w-7 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Axiom Field
              </p>
              <p className="text-sm text-muted">Sales Execution Platform</p>
            </div>
          </div>

          <h1 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Run every field call with intelligence, coaching, and proof.
          </h1>

          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted md:text-lg">
            Capture pre-call context, guide the conversation with live prompts, and
            close the loop with a structured debrief—so reps improve on every
            appointment, not just the easy ones.
          </p>

          {/* CTAs */}
          <div className="mt-10 w-full max-w-md space-y-4">
            <form
              onSubmit={onStartSession}
              className="rounded-2xl border border-border bg-card/80 p-6 shadow-soft backdrop-blur-sm"
            >
              <label
                htmlFor="repName"
                className="mb-2 block text-left text-sm font-medium text-foreground"
              >
                Your name
              </label>
              <input
                id="repName"
                type="text"
                value={repName}
                onChange={(e) => onRepNameChange(e.target.value)}
                placeholder="e.g. Jordan Reeves"
                required
                autoComplete="name"
                className="mb-4 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <button
                type="submit"
                disabled={loading || !repName.trim()}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition",
                  "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                )}
              >
                {loading ? (
                  "Starting…"
                ) : (
                  <>
                    Start Session
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </>
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={onExplorePlatform}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-5 py-3 text-sm font-medium text-foreground transition hover:border-accent/40 hover:bg-accent/5"
            >
              <Sparkles className="h-4 w-4 text-accent" aria-hidden />
              Explore the platform
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
