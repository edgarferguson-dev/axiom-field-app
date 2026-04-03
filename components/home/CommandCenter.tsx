"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  History,
  LayoutDashboard,
  LogIn,
  Play,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AxiomFieldLogo } from "@/components/branding/AxiomFieldLogo";
import type { SessionHistoryEntry } from "@/store/session-store";

type CommandCenterProps = {
  repName: string;
  onRepNameChange: (v: string) => void;
  onStartSession: (e: React.FormEvent) => void;
  loading: boolean;
  sessionId: string | null;
  sessionRepName: string | null;
  sessionHistory: SessionHistoryEntry[];
};

function Tile({
  href,
  icon: Icon,
  title,
  description,
  className,
}: {
  href: string;
  icon: typeof LayoutDashboard;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex w-full items-start gap-3 rounded-2xl border border-border/70 bg-card/85 p-4 text-left shadow-soft transition",
        "hover:border-accent/35 hover:bg-card",
        className
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/15">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{description}</p>
      </div>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-muted opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
        aria-hidden
      />
    </Link>
  );
}

/** Home operating hub: start, resume, materials, settings. (Local-first, deploy-safe.) */
export function CommandCenter({
  repName,
  onRepNameChange,
  onStartSession,
  loading,
  sessionId,
  sessionRepName,
  sessionHistory: sessionHistoryProp,
}: CommandCenterProps) {
  const sessionHistory = Array.isArray(sessionHistoryProp) ? sessionHistoryProp : [];
  const continueHref = sessionId ? `/session/${sessionId}/field-read` : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <header className="mb-8 rounded-3xl border border-border bg-surface p-6 shadow-soft ring-1 ring-foreground/[0.04] md:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <AxiomFieldLogo size="lg" className="shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
              Command Center
            </p>
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Fast, tactical, and buyer-safe.
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              Load your materials before you go live. Run scout → proof → decision without turning the call into
              a software tour.
            </p>
          </div>
        </div>
      </header>

      <section aria-label="Primary actions" className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">New session</p>
          <form onSubmit={onStartSession} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label htmlFor="hub-rep" className="mb-1 block text-xs font-medium text-foreground">
                Rep name
              </label>
              <input
                id="hub-rep"
                value={repName}
                onChange={(e) => onRepNameChange(e.target.value)}
                placeholder="Your name"
                required
                autoComplete="name"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !repName.trim()}
              className={cn(
                "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition",
                "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              )}
            >
              <Play className="h-4 w-4" aria-hidden />
              {loading ? "Starting…" : "Start"}
            </button>
          </form>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {continueHref && (
            <Tile
              href={continueHref}
              icon={LayoutDashboard}
              title="Continue session"
              description={sessionRepName ? `${sessionRepName} — resume workspace` : "Resume where you left off"}
              className="sm:col-span-2"
            />
          )}

          <Tile href="/materials" icon={BookOpen} title="Presentation library" description="Pick ammo before demo" />
          <Tile href="/settings" icon={Settings} title="Settings" description="Local workspace controls" />
          <Tile href="/login" icon={LogIn} title="Account" description="Lightweight gate" />
        </div>
      </section>

      <section aria-label="Recent sessions" className="mt-8 rounded-2xl border border-border/60 bg-surface/50 p-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
          <History className="h-4 w-4" aria-hidden />
          Recent
        </div>
        {sessionHistory.length === 0 ? (
          <p className="text-sm text-muted">No entries yet — starting a session adds one (local only).</p>
        ) : (
          <ul className="space-y-1">
            {sessionHistory.map((h) => (
              <li key={h.id}>
                <Link
                  href={`/session/${h.id}/field-read`}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition hover:bg-card"
                >
                  <span className="font-medium text-foreground">{h.repName}</span>
                  <span className="text-xs text-muted tabular-nums">
                    {new Date(h.updatedAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[11px] text-muted/90">
          Quick links only. Full state is stored locally in this browser.
        </p>
      </section>
    </div>
  );
}

