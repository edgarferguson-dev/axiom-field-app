"use client";

import { useCallback, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";

/** Matches `var(--texture-noise)` in globals — kept inline for nav blend */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")";

function IconScout({ className }: { className?: string }) {
  return (
    <svg className={className} width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconBrief({ className }: { className?: string }) {
  return (
    <svg className={className} width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 4h8v16H8V4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 8h8M8 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconProof({ className }: { className?: string }) {
  return (
    <svg className={className} width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7l8-3 8 3v10l-8 3-8-3V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconReport({ className }: { className?: string }) {
  return (
    <svg className={className} width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 3h10v18H7V3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 8h4M10 12h4M10 16h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconReview({ className }: { className?: string }) {
  return (
    <svg className={className} width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 11l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

const TABS: {
  id: "scout" | "brief" | "proof" | "report" | "review";
  label: string;
  Icon: typeof IconScout;
  path: (sessionId: string) => string;
}[] = [
  { id: "scout", label: "Scout", Icon: IconScout, path: (sid) => `/session/${sid}/field-read?mode=scout` },
  { id: "brief", label: "Brief", Icon: IconBrief, path: (sid) => `/session/${sid}/brief` },
  { id: "proof", label: "Proof Run", Icon: IconProof, path: (sid) => `/session/${sid}/demo` },
  { id: "report", label: "Report", Icon: IconReport, path: (sid) => `/session/${sid}/health-report` },
  { id: "review", label: "Review", Icon: IconReview, path: (sid) => `/session/${sid}/recap` },
];

export function SessionBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const paramSessionId = typeof params?.sessionId === "string" ? params.sessionId : "";
  const storeSessionId = useSessionStore((s) => s.session?.id ?? "");
  const sessionId = paramSessionId || storeSessionId;
  const hasBrief = useSessionStore((s) => !!s.session?.preCallIntel);
  const liveDemoBuyerStarted = useSessionStore((s) => s.session?.liveDemoBuyerStarted ?? false);
  const proofRunPhase = useSessionStore((s) => s.session?.proofRun?.phase ?? "idle");
  const proofRunInProgress = proofRunPhase !== "idle" && proofRunPhase !== "complete";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const modeScout = searchParams.get("mode") === "scout";
  const path = pathname ?? "";

  const activeTab = ((): (typeof TABS)[number]["id"] | null => {
    if (!path.includes("/session/")) return null;
    if (path.includes("/constraints")) return "scout";
    if (path.includes("/brief")) return "brief";
    if (path.includes("/demo")) return "proof";
    if (path.includes("/health-report")) return "report";
    if (
      path.includes("/recap") ||
      path.includes("/disposition") ||
      path.includes("/offer-fit") ||
      path.includes("/close")
    ) {
      return "review";
    }
    if (path.includes("/field-read")) {
      if (hasBrief && !modeScout) return "brief";
      return "scout";
    }
    return "scout";
  })();

  const navigate = useCallback(
    (href: string, tabId: (typeof TABS)[number]["id"]) => {
      const onDemo = path.includes("/demo");
      if (onDemo && (liveDemoBuyerStarted || proofRunInProgress) && tabId !== "proof") {
        setPendingHref(href);
        setConfirmOpen(true);
        return;
      }
      router.push(href);
    },
    [path, liveDemoBuyerStarted, proofRunInProgress, router]
  );

  const confirmLeave = useCallback(() => {
    useSessionStore.getState().proofRunDispatch({ type: "exit", reason: "tab_nav" });
    if (pendingHref) router.push(pendingHref);
    setConfirmOpen(false);
    setPendingHref(null);
  }, [pendingHref, router]);

  const showBar = Boolean(sessionId) || path.startsWith("/session/") || path.startsWith("/settings");
  if (!showBar) {
    return null;
  }

  const sessionReady = Boolean(sessionId.trim());

  return (
    <>
      <nav
        className={cn(
          "pointer-events-auto fixed bottom-0 left-0 right-0 flex touch-manipulation items-stretch justify-between",
          "border-t border-ink-border/80 bg-ink-950 shadow-ink"
        )}
        style={{
          zIndex: 9999,
          minHeight: "calc(64px + env(safe-area-inset-bottom, 0px))",
          paddingBottom: "env(safe-area-inset-bottom)",
          backgroundImage: NOISE,
        }}
        aria-label="Session navigation"
      >
        {TABS.map((tab) => {
          const href = tab.path(sessionId);
          const active = activeTab !== null && activeTab === tab.id;
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(href, tab.id)}
              disabled={!sessionReady}
              className={cn(
                "relative flex min-h-[64px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 outline-none transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-35",
                active
                  ? "border-t-2 border-accent bg-ink-900/95 text-accent"
                  : "border-t-2 border-transparent text-muted"
              )}
              style={{
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
              }}
            >
              <Icon className="shrink-0" />
              <span
                className={cn(
                  "max-w-full truncate px-0.5 text-[10px] font-semibold leading-tight sm:text-[11px]",
                  active ? "text-accent" : "text-muted"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-proof-title"
        >
          <div className="dani-card--ink w-full max-w-sm p-5 shadow-elevated">
            <h2 id="exit-proof-title" className="text-lg font-semibold">
              Exit proof run?
            </h2>
            <p className="mt-2 text-sm text-white/60">You can return to Proof Run anytime from this bar.</p>
            <div className="mt-4 flex flex-col gap-2">
              <button type="button" className="btn-primary" onClick={confirmLeave}>
                Leave
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setConfirmOpen(false);
                  setPendingHref(null);
                }}
              >
                Stay
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
