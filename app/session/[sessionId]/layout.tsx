"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useParams, usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Topbar } from "@/components/layout/topbar";
import {
  SessionFlowProgress,
  getSessionFlowStep,
} from "@/components/layout/session-flow-progress";
import { LiveCoachingOverlay } from "@/components/coaching/LiveCoachingOverlay";
import { SessionBottomNav } from "@/components/layout/SessionBottomNav";
import { useSessionStore } from "@/store/session-store";
import { createEmptyPresentation } from "@/types/presentation";
import { useSessionStoreHydrated } from "@/hooks/use-session-store-hydrated";

/** Stable local/demo URL segment — bookmark ` /session/demo-session/... ` without starting from home. */
const DEMO_SESSION_SLUG = "demo-session";

export default function SessionLayout({ children }: { children: ReactNode }) {
  const hydrated = useSessionStoreHydrated();
  const params = useParams();
  const pathname = usePathname();
  const sessionId = typeof params?.sessionId === "string" ? params.sessionId : undefined;
  const session = useSessionStore((s) => s.session);
  const sessionHistory = useSessionStore((s) => s.sessionHistory ?? []);
  const mergeFlowMaxStep = useSessionStore((s) => s.mergeFlowMaxStep);
  const initSession = useSessionStore((s) => s.initSession);

  useEffect(() => {
    if (!hydrated || sessionId !== DEMO_SESSION_SLUG) return;
    if (session?.id === DEMO_SESSION_SLUG) return;
    initSession(DEMO_SESSION_SLUG, "Demo rep");
  }, [hydrated, sessionId, session?.id, initSession]);

  /**
   * Deep links and refresh: if storage is empty (private mode, blocked localStorage, or
   * first paint before persist wrote), the store has no `session` but the URL still has
   * an id. Recreate a minimal session from the path so routes render instead of a dead end.
   */
  useEffect(() => {
    if (!hydrated || !sessionId || sessionId === DEMO_SESSION_SLUG) return;
    if (session?.id === sessionId) return;
    if (session) return;

    const entry = sessionHistory.find((h) => h.id === sessionId);
    const rep = entry?.repName?.trim() || "Session";
    initSession(sessionId, rep);
  }, [hydrated, sessionId, session?.id, session, sessionHistory, initSession]);

  useEffect(() => {
    if (!session) return;
    const presentation = session.presentation ?? createEmptyPresentation();
    const step = getSessionFlowStep(
      pathname,
      presentation,
      session.phase,
      !!session.preCallIntel
    );
    mergeFlowMaxStep(step);
  }, [pathname, session, mergeFlowMaxStep]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background p-6 text-sm text-muted">
        Loading session…
      </div>
    );
  }

  if (!session) {
    if (sessionId === DEMO_SESSION_SLUG) {
      return (
        <div className="min-h-screen bg-background p-6 text-sm text-muted">
          Loading demo session…
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-background p-6 text-sm text-muted">
        <p>No active session in storage.</p>
        <p className="mt-3 max-w-md text-xs leading-relaxed opacity-90">
          Private/incognito windows start with empty storage — open the app from Home in a normal window, or allow site
          data for this origin.
        </p>
        <a href="/" className="mt-3 inline-block text-accent underline">
          Return home to start a session
        </a>
      </div>
    );
  }

  const presentation = session.presentation ?? createEmptyPresentation();

  const subtitle = session.repName
    ? `${session.repName} · ${session.business?.name ?? "New Session"}`
    : "Sales Execution Platform";

  return (
    <AppShell>
      <div className="pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
        <Topbar title="Axiom Field" subtitle={subtitle} />
        <SessionFlowProgress
          sessionId={sessionId}
          flowMaxStep={session.flowMaxStep ?? 1}
          presentation={presentation}
          phase={session.phase}
          preCallIntelReady={!!session.preCallIntel}
        />
        {children}
      </div>
      <SessionBottomNav />
      <LiveCoachingOverlay />
    </AppShell>
  );
}
