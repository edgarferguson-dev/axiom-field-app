"use client";

import { useCallback, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session-store";

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")";

const TABS: {
  id: string;
  label: string;
  icon: string;
  path: (sessionId: string) => string;
}[] = [
  { id: "scout", label: "Scout", icon: "🔍", path: (sid) => `/session/${sid}/field-read` },
  { id: "proof", label: "Proof Run", icon: "📊", path: (sid) => `/session/${sid}/demo` },
  { id: "review", label: "Review", icon: "📋", path: (sid) => `/session/${sid}/recap` },
  { id: "settings", label: "Settings", icon: "⚙️", path: () => "/settings" },
];

export function SessionBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const paramSessionId = typeof params?.sessionId === "string" ? params.sessionId : "";
  const storeSessionId = useSessionStore((s) => s.session?.id ?? "");
  const sessionId = paramSessionId || storeSessionId;
  const liveDemoBuyerStarted = useSessionStore((s) => s.session?.liveDemoBuyerStarted ?? false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const activeTab = (() => {
    if (pathname?.startsWith("/settings")) return "settings";
    if (!sessionId) return "scout";
    if (pathname?.includes("/demo")) return "proof";
    if (
      pathname?.includes("/recap") ||
      pathname?.includes("/disposition") ||
      pathname?.includes("/offer-fit") ||
      pathname?.includes("/close")
    ) {
      return "review";
    }
    return "scout";
  })();

  const navigate = useCallback(
    (href: string, tabId: string) => {
      const onDemo = pathname?.includes("/demo");
      if (onDemo && liveDemoBuyerStarted && tabId !== "proof") {
        setPendingHref(href);
        setConfirmOpen(true);
        return;
      }
      router.push(href);
    },
    [pathname, liveDemoBuyerStarted, router]
  );

  const confirmLeave = useCallback(() => {
    if (pendingHref) router.push(pendingHref);
    setConfirmOpen(false);
    setPendingHref(null);
  }, [pendingHref, router]);

  const showBar = sessionId || pathname?.startsWith("/session/");
  if (!showBar && !pathname?.startsWith("/settings")) {
    return null;
  }

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 flex touch-manipulation items-stretch justify-around border-t border-[#363636] bg-[#1a1a1a] shadow-[0_-4px_16px_rgba(0,0,0,0.4)]"
        style={{
          zIndex: 9999,
          height: "calc(64px + env(safe-area-inset-bottom, 0px))",
          paddingBottom: "env(safe-area-inset-bottom)",
          backgroundImage: NOISE,
        }}
        aria-label="Session navigation"
      >
        {TABS.map((tab) => {
          const href = tab.path(sessionId);
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(href, tab.id)}
              disabled={tab.id !== "settings" && !sessionId.trim()}
              className="relative flex min-h-[48px] min-w-[48px] flex-1 flex-col items-center justify-center border-0 bg-transparent px-1 text-[11px] font-medium text-[#a0a0a0] outline-none transition-colors disabled:opacity-40"
              style={{
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
                cursor: "pointer",
                fontWeight: active ? 700 : 500,
                color: active ? "#14b8a6" : "#a0a0a0",
              }}
            >
              {active ? (
                <span
                  className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #14b8a6, #22d3ee)",
                  }}
                  aria-hidden
                />
              ) : null}
              <span className="mb-0.5 text-[22px] leading-none" aria-hidden>
                {tab.icon}
              </span>
              <span className="leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-proof-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#363636] bg-[#1a1a1a] p-5 text-white shadow-xl">
            <h2 id="exit-proof-title" className="text-lg font-semibold">
              Exit proof run?
            </h2>
            <p className="mt-2 text-sm text-[#a0a0a0]">You can return to Proof Run anytime from this bar.</p>
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
