import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sessionPersistStorage } from "@/lib/storage/sessionPersistStorage";
import { PERSIST_KEY_SESSION } from "@/lib/storage/persistKeys";
import type {
  Session,
  SessionPhase,
  BusinessProfile,
  PreCallIntel,
  FieldEngagementDecision,
  DemoCloseState,
  CoachingPrompt,
  PerformanceScore,
  ObjectionType,
  SalesStep,
  Signal,
  SignalColor,
  BusinessConstraint,
  CloseOutcome,
  FieldSnapshotKey,
} from "@/types/session";
import { createEmptyPresentation } from "@/types/presentation";
import type { MaterialSummary } from "@/lib/flows/materialEngine";
import {
  buildStrategyPackage,
  generatePresentationSlides,
} from "@/lib/flows/presentationEngine";
import {
  createInitialInteractiveDemoState,
  reduceInteractiveDemo,
  type InteractiveDemoEvent,
} from "@/lib/flows/interactiveDemoEngine";
import type { DispositionResult } from "@/types/disposition";
import type { Lead } from "@/types/lead";
import type { BuyerState, CoachingMomentum, DemoViewMode } from "@/types/demo";
import type { BuyerReaction, ProofAssessment, ProofBrief, ProofEvent, ProofSequence } from "@/types/proof";
import type { CloseAssessment, CloseEvent, ClosePath, CloseRecommendation } from "@/types/close";
import {
  buildDefaultProofSequence,
  buildProofBrief,
  deriveProofAssessment,
  lastProofEventForBlock,
  normalizeCurrentProofBlockId,
} from "@/lib/flows/proofEngine";
import { deriveCloseAssessment, shouldAppendCloseEvent } from "@/lib/flows/closeEngine";
import {
  createInitialMethodStrategySnapshot,
  DEFAULT_METHOD_ID,
  getMethodContextForSession,
} from "@/lib/flows/methodEngine";
import { isValidMethodId } from "@/types/method";
import { normalizePreCallIntel } from "@/lib/pre-call/normalizer";

export type SessionHistoryEntry = {
  id: string;
  repName: string;
  updatedAt: number;
};

type SessionStore = {
  session: Session | null;
  disposition: DispositionResult | null;
  sessionHistory: SessionHistoryEntry[];
  /** Materials selected in Library before business exists (applied when slides generate). */
  pendingPresentationMaterial: MaterialSummary | null;
  /** Live deal signal for Command Mode + private demo UI (distinct from `session.signals[]`). */
  signal: SignalColor;
  commandMode: boolean;
  /** Demo route: single-surface mode switch. */
  demoViewMode: DemoViewMode;
  buyerState: BuyerState;
  coachingMomentum: CoachingMomentum;
  /** Current slide type id for adaptive coaching (set by PresentationEngine). */
  demoSlideType: string | null;

  setDemoViewMode: (mode: DemoViewMode) => void;
  setBuyerState: (state: BuyerState) => void;
  setCoachingMomentum: (m: CoachingMomentum) => void;
  setDemoSlideType: (type: string | null) => void;

  initSession: (id: string, repName: string) => void;
  setPhase: (phase: SessionPhase) => void;
  setBusiness: (business: BusinessProfile) => void;
  setPreCallIntel: (intel: PreCallIntel | null) => void;
  setFieldEngagementDecision: (decision: FieldEngagementDecision | null) => void;
  setCloseState: (state: DemoCloseState | null) => void;
  setCloseCTAs: (primaryCTA: string | null, backupCTA: string | null) => void;
  setObjectionTriggered: (value: boolean) => void;
  setFieldSnapshot: (keys: FieldSnapshotKey[]) => void;
  setConstraints: (constraints: BusinessConstraint[]) => void;
  setCloseOutcome: (outcome: CloseOutcome) => void;
  addCoachingPrompt: (prompt: CoachingPrompt) => void;
  setRepNotes: (notes: string) => void;
  setScore: (score: PerformanceScore) => void;
  markStarted: () => void;
  markCompleted: () => void;
  clearSession: () => void;

  addObjection: (objection: ObjectionType) => void;
  addSalesStep: (step: SalesStep) => void;
  addSignal: (signal: Signal) => void;
  setDisposition: (disposition: DispositionResult) => void;
  /** Expands allowed loop-back targets (max of 1–5 progress steps). */
  mergeFlowMaxStep: (step: number) => void;
  startSession: (repName: string) => string;
  /** Start field-read session from directory lead; prefills business + notes. */
  startSessionFromLead: (lead: Lead, repName: string) => string;
  reset: () => void;

  ensurePresentationSlides: () => void;
  applyPresentationMaterial: (summary: MaterialSummary) => void;
  setPresentationPricingTierId: (tierId: string | null) => void;
  setPresentationPricingResponse: (
    response: "accept" | "hesitate" | "reject" | null
  ) => void;
  setPresentationOpenAccountStarted: (started: boolean) => void;
  dispatchInteractiveProofEvent: (event: InteractiveDemoEvent) => void;

  setSignal: (signal: SignalColor) => void;
  setCommandMode: (value: boolean) => void;

  /** RFC 1 — Proof Engine */
  initializeProofState: () => void;
  setProofBrief: (brief: ProofBrief | null) => void;
  setProofSequence: (sequence: ProofSequence | null) => void;
  setCurrentProofBlock: (blockId: string | null) => void;
  markProofShown: (blockId: string) => void;
  markProofSkipped: (blockId: string) => void;
  markProofRevisited: (blockId: string) => void;
  setProofBuyerReaction: (blockId: string, reaction: BuyerReaction) => void;
  setProofAssessment: (assessment: ProofAssessment | null) => void;
  refreshProofAssessment: () => void;
  resetProofState: () => void;

  /** RFC 2 — Close Engine */
  setCloseAssessment: (a: CloseAssessment | null) => void;
  markClosePrompted: (closePath?: ClosePath) => void;
  markCloseAttempted: (closePath?: ClosePath) => void;
  markCloseDeferred: (closePath?: ClosePath) => void;
  markCloseBlocked: (closePath?: ClosePath) => void;
  markCloseAdvanced: (closePath?: ClosePath) => void;
  refreshDemoInsightLayer: () => void;
  refreshPostDemoInsights: () => void;
  resetCloseState: () => void;
};

function makeEmptySession(
  id: string,
  repName: string,
  phase: SessionPhase
): Session {
  return {
    id,
    repName,
    createdAt: Date.now(),
    phase,
    business: null,
    preCallIntel: null,
    fieldEngagementDecision: null,
    closeState: null,
    primaryCTA: null,
    backupCTA: null,
    objectionTriggered: false,
    fieldSnapshot: [],
    constraints: [],
    closeOutcome: null,
    coachingPrompts: [],
    repNotes: "",
    startedAt: null,
    completedAt: null,
    score: null,
    presentation: createEmptyPresentation(),
    flowMaxStep: 1,
    signals: [],
    objections: [],
    salesSteps: [],
    proofBrief: null,
    proofSequence: null,
    currentProofBlockId: null,
    proofEvents: [],
    proofAssessment: null,
    closeEvents: [],
    closeAssessment: null,
    activeMethodId: DEFAULT_METHOD_ID,
    methodStrategy: createInitialMethodStrategySnapshot(),
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Proof + close assessment in one pass — canonical `deriveCloseAssessment` only (RFC 2; not pricing/close-outcome workflow). */
function finalizeSessionInsights(
  session: Session,
  signal: SignalColor,
  buyerState: BuyerState
): Session {
  const methodContext = getMethodContextForSession(session);
  const nextPa = deriveProofAssessment(
    session.proofSequence,
    session.proofEvents ?? [],
    methodContext
  );
  const sess: Session = {
    ...session,
    proofAssessment: nextPa ?? session.proofAssessment,
  };
  const closeAssessment = deriveCloseAssessment({
    session: sess,
    liveSignal: signal,
    buyerState,
    closeEvents: sess.closeEvents ?? [],
    methodContext,
  });
  return { ...sess, closeAssessment: closeAssessment ?? null };
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      session: null,
      disposition: null,
      sessionHistory: [],
      pendingPresentationMaterial: null,
      signal: "yellow",
      commandMode: false,
      demoViewMode: "public",
      buyerState: "unknown",
      coachingMomentum: "flat",
      demoSlideType: null,

      setDemoViewMode: (demoViewMode) => set({ demoViewMode }),
      setBuyerState: (buyerState) => set({ buyerState }),
      setCoachingMomentum: (coachingMomentum) => set({ coachingMomentum }),
      setDemoSlideType: (demoSlideType) => set({ demoSlideType }),

      setSignal: (signal) =>
        set({
          signal,
          commandMode: signal === "green",
        }),

      setCommandMode: (commandMode) => set({ commandMode }),

      initSession: (id, repName) =>
        set({
          session: makeEmptySession(id, repName, "pre-call"),
          disposition: null,
          signal: "yellow",
          commandMode: false,
          demoViewMode: "public",
          buyerState: "unknown",
          coachingMomentum: "flat",
          demoSlideType: null,
        }),

      startSession: (repName) => {
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `ax-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
        const entry: SessionHistoryEntry = { id, repName, updatedAt: Date.now() };
        set((s) => ({
          session: makeEmptySession(id, repName, "field-read"),
          disposition: null,
          sessionHistory: [entry, ...s.sessionHistory.filter((h) => h.id !== id)].slice(0, 8),
          pendingPresentationMaterial: s.pendingPresentationMaterial,
          signal: "yellow",
          commandMode: false,
          demoViewMode: "public",
          buyerState: "unknown",
          coachingMomentum: "flat",
          demoSlideType: null,
        }));
        return id;
      },

      startSessionFromLead: (lead, repName) => {
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `ax-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
        const entry: SessionHistoryEntry = { id, repName, updatedAt: Date.now() };
        const business: BusinessProfile = {
          name: lead.businessName,
          type: lead.category || "General",
          currentSystem: "",
          leadSource: "Directory",
          notes: lead.notes || undefined,
          ownerName: lead.contactName || undefined,
          contactPhone: lead.phone || undefined,
          contactEmail: lead.email || undefined,
          address: lead.address || undefined,
        };
        set((s) => ({
          session: { ...makeEmptySession(id, repName, "field-read"), business },
          disposition: null,
          sessionHistory: [entry, ...s.sessionHistory.filter((h) => h.id !== id)].slice(0, 8),
          pendingPresentationMaterial: s.pendingPresentationMaterial,
          signal: "yellow",
          commandMode: false,
          demoViewMode: "public",
          buyerState: "unknown",
          coachingMomentum: "flat",
          demoSlideType: null,
        }));
        return id;
      },

      setPhase: (phase) =>
        set((s) => (s.session ? { session: { ...s.session, phase } } : s)),

      setBusiness: (business) =>
        set((s) => (s.session ? { session: { ...s.session, business } } : s)),

      setPreCallIntel: (intel) =>
        set((s) => {
          if (!s.session) return s;
          // Always normalize before persisting — guards against stale localStorage
          // data and direct store writes that bypass the AI/fallback pipeline.
          const preCallIntel = intel ? (normalizePreCallIntel(intel) ?? intel) : null;
          return { session: { ...s.session, preCallIntel } };
        }),

      setFieldEngagementDecision: (fieldEngagementDecision) =>
        set((s) =>
          s.session ? { session: { ...s.session, fieldEngagementDecision } } : s
        ),

      setCloseState: (closeState) =>
        set((s) => (s.session ? { session: { ...s.session, closeState } } : s)),

      setCloseCTAs: (primaryCTA, backupCTA) =>
        set((s) =>
          s.session ? { session: { ...s.session, primaryCTA, backupCTA } } : s
        ),

      setObjectionTriggered: (objectionTriggered) =>
        set((s) =>
          s.session ? { session: { ...s.session, objectionTriggered } } : s
        ),

      setFieldSnapshot: (fieldSnapshot) =>
        set((s) => (s.session ? { session: { ...s.session, fieldSnapshot } } : s)),

      setConstraints: (constraints) =>
        set((s) => (s.session ? { session: { ...s.session, constraints } } : s)),

      setCloseOutcome: (closeOutcome) =>
        set((s) => (s.session ? { session: { ...s.session, closeOutcome } } : s)),

      addCoachingPrompt: (prompt) =>
        set((s) =>
          s.session
            ? { session: { ...s.session, coachingPrompts: [...s.session.coachingPrompts, prompt] } }
            : s
        ),

      setRepNotes: (repNotes) =>
        set((s) => (s.session ? { session: { ...s.session, repNotes } } : s)),

      setScore: (score) =>
        set((s) => (s.session ? { session: { ...s.session, score } } : s)),

      markStarted: () =>
        set((s) =>
          s.session ? { session: { ...s.session, startedAt: Date.now() } } : s
        ),

      markCompleted: () =>
        set((s) =>
          s.session ? { session: { ...s.session, completedAt: Date.now() } } : s
        ),

      clearSession: () =>
        set({
          session: null,
          disposition: null,
          signal: "yellow",
          commandMode: false,
          demoViewMode: "public",
          buyerState: "unknown",
          coachingMomentum: "flat",
          demoSlideType: null,
        }),

      addObjection: (objection) =>
        set((s) =>
          s.session
            ? { session: { ...s.session, objections: [...s.session.objections, objection] } }
            : s
        ),

      addSalesStep: (step) =>
        set((s) =>
          s.session
            ? { session: { ...s.session, salesSteps: [...s.session.salesSteps, step] } }
            : s
        ),

      addSignal: (signal) =>
        set((s) =>
          s.session
            ? { session: { ...s.session, signals: [...s.session.signals, signal] } }
            : s
        ),

      setDisposition: (disposition) => set({ disposition }),

      mergeFlowMaxStep: (step) =>
        set((s) => {
          if (!s.session) return s;
          const next = Math.max(1, Math.min(5, Math.floor(step)));
          const prev = s.session.flowMaxStep ?? 1;
          if (next <= prev) return s;
          return { session: { ...s.session, flowMaxStep: next } };
        }),

      reset: () =>
        set({
          session: null,
          disposition: null,
          signal: "yellow",
          commandMode: false,
          demoViewMode: "public",
          buyerState: "unknown",
          coachingMomentum: "flat",
          demoSlideType: null,
        }),

      ensurePresentationSlides: () =>
        set((s) => {
          if (!s.session?.business) return s;
          const prev = s.session.presentation ?? createEmptyPresentation();
          if (prev.generatedSlides.length > 0) return s;
          const material = prev.materialSummary ?? s.pendingPresentationMaterial ?? undefined;
          const strategy = buildStrategyPackage(
            s.session.business,
            s.session.preCallIntel,
            material
          );
          const generatedSlides = generatePresentationSlides(
            s.session.business,
            strategy,
            s.session.preCallIntel
          );
          return {
            pendingPresentationMaterial: null,
            session: {
              ...s.session,
              presentation: { ...prev, materialSummary: material ?? prev.materialSummary, strategyPackage: strategy, generatedSlides },
            },
          };
        }),

      applyPresentationMaterial: (summary) =>
        set((s) => {
          if (!s.session?.business) {
            return { ...s, pendingPresentationMaterial: summary };
          }
          const strategy = buildStrategyPackage(
            s.session.business,
            s.session.preCallIntel,
            summary
          );
          const generatedSlides = generatePresentationSlides(
            s.session.business,
            strategy,
            s.session.preCallIntel
          );
          const empty = createEmptyPresentation();
          return {
            session: {
              ...s.session,
              presentation: { ...empty, materialSummary: summary, strategyPackage: strategy, generatedSlides },
            },
            pendingPresentationMaterial: null,
          };
        }),

      setPresentationPricingTierId: (tierId) =>
        set((s) => {
          if (!s.session) return s;
          const pres = s.session.presentation;
          return {
            session: { ...s.session, presentation: { ...pres, pricingTierId: tierId } },
          };
        }),

      setPresentationPricingResponse: (pricingResponse) =>
        set((s) => {
          if (!s.session) return s;
          const pres = s.session.presentation ?? createEmptyPresentation();
          return {
            session: {
              ...s.session,
              presentation: {
                ...pres,
                pricingResponse,
                pricingAccepted: pricingResponse === "accept",
              },
            },
          };
        }),

      setPresentationOpenAccountStarted: (openAccountStarted) =>
        set((s) => {
          if (!s.session) return s;
          const pres = s.session.presentation ?? createEmptyPresentation();
          return {
            session: { ...s.session, presentation: { ...pres, openAccountStarted } },
          };
        }),

      dispatchInteractiveProofEvent: (event) =>
        set((s) => {
          if (!s.session) return s;
          const pres = s.session.presentation ?? createEmptyPresentation();
          const interactiveProof = reduceInteractiveDemo(pres.interactiveProof, event);
          return {
            session: { ...s.session, presentation: { ...pres, interactiveProof } },
          };
        }),

      initializeProofState: () =>
        set((s) => {
          if (!s.session) return s;
          if (s.session.proofSequence && s.session.proofBrief) {
            const seq = s.session.proofSequence;
            const start = seq.recommendedStartBlockId || seq.blocks[0]?.id || "";
            const currentProofBlockId = normalizeCurrentProofBlockId(
              seq,
              s.session.currentProofBlockId,
              start
            );
            return { session: { ...s.session, currentProofBlockId } };
          }
          const brief = buildProofBrief(s.session);
          const sequence = buildDefaultProofSequence(brief, s.session);
          const start = sequence.recommendedStartBlockId || sequence.blocks[0]?.id || "";
          const keepEvents = !!s.session.proofSequence;
          return {
            session: {
              ...s.session,
              proofBrief: brief,
              proofSequence: sequence,
              currentProofBlockId: start,
              proofEvents: keepEvents ? (s.session.proofEvents ?? []) : [],
              proofAssessment: null,
            },
          };
        }),

      setProofBrief: (proofBrief) =>
        set((s) => (s.session ? { session: { ...s.session, proofBrief } } : s)),

      setProofSequence: (proofSequence) =>
        set((s) => (s.session ? { session: { ...s.session, proofSequence } } : s)),

      setCurrentProofBlock: (currentProofBlockId) =>
        set((s) => (s.session ? { session: { ...s.session, currentProofBlockId } } : s)),

      markProofShown: (proofBlockId) =>
        set((s) => {
          if (!s.session) return s;
          const events = s.session.proofEvents;
          const last = lastProofEventForBlock(events, proofBlockId);
          if (last?.status === "shown") return s;

          const ev: ProofEvent = {
            proofBlockId,
            status: "shown",
            buyerReaction: "unclear",
            timestamp: nowIso(),
          };
          return {
            session: {
              ...s.session,
              proofEvents: [...events, ev],
            },
          };
        }),

      markProofSkipped: (proofBlockId) =>
        set((s) => {
          if (!s.session) return s;
          const events = s.session.proofEvents;
          const last = lastProofEventForBlock(events, proofBlockId);
          if (last?.status === "skipped") return s;

          const ev: ProofEvent = {
            proofBlockId,
            status: "skipped",
            buyerReaction: "unclear",
            timestamp: nowIso(),
          };
          return {
            session: {
              ...s.session,
              proofEvents: [...events, ev],
            },
          };
        }),

      markProofRevisited: (proofBlockId) =>
        set((s) => {
          if (!s.session) return s;
          const ev: ProofEvent = {
            proofBlockId,
            status: "revisited",
            buyerReaction: "unclear",
            timestamp: nowIso(),
          };
          return {
            session: {
              ...s.session,
              proofEvents: [...s.session.proofEvents, ev],
            },
          };
        }),

      setProofBuyerReaction: (proofBlockId, buyerReaction) =>
        set((s) => {
          if (!s.session) return s;
          const events = s.session.proofEvents;
          let last = -1;
          for (let i = events.length - 1; i >= 0; i--) {
            if (events[i].proofBlockId !== proofBlockId) continue;
            if (events[i].status === "skipped") continue;
            last = i;
            break;
          }
          if (last < 0) {
            return {
              session: {
                ...s.session,
                proofEvents: [
                  ...events,
                  {
                    proofBlockId,
                    status: "shown" as const,
                    buyerReaction,
                    timestamp: nowIso(),
                  },
                ],
              },
            };
          }
          const proofEvents = [...events];
          proofEvents[last] = { ...proofEvents[last], buyerReaction };
          return { session: { ...s.session, proofEvents } };
        }),

      setProofAssessment: (proofAssessment) =>
        set((s) => (s.session ? { session: { ...s.session, proofAssessment } } : s)),

      refreshProofAssessment: () =>
        set((s) => {
          if (!s.session?.proofSequence) return s;
          const methodContext = getMethodContextForSession(s.session);
          const proofAssessment = deriveProofAssessment(
            s.session.proofSequence,
            s.session.proofEvents,
            methodContext
          );
          return proofAssessment
            ? { session: { ...s.session, proofAssessment } }
            : s;
        }),

      resetProofState: () =>
        set((s) =>
          s.session
            ? {
                session: {
                  ...s.session,
                  proofBrief: null,
                  proofSequence: null,
                  currentProofBlockId: null,
                  proofEvents: [],
                  proofAssessment: null,
                  closeEvents: [],
                  closeAssessment: null,
                },
              }
            : s
        ),

      setCloseAssessment: (closeAssessment) =>
        set((s) => (s.session ? { session: { ...s.session, closeAssessment } } : s)),

      markClosePrompted: (pathOverride) =>
        set((s) => {
          if (!s.session) return s;
          const closePath =
            pathOverride ?? s.session.closeAssessment?.recommendation?.path ?? "clarify_value";
          const ev: CloseEvent = { type: "prompted", closePath, timestamp: nowIso() };
          const prev = s.session.closeEvents ?? [];
          if (!shouldAppendCloseEvent(prev, ev)) return s;
          const session = { ...s.session, closeEvents: [...prev, ev] };
          return { session: finalizeSessionInsights(session, s.signal, s.buyerState) };
        }),

      markCloseAttempted: (pathOverride) =>
        set((s) => {
          if (!s.session) return s;
          const closePath =
            pathOverride ?? s.session.closeAssessment?.recommendation?.path ?? "clarify_value";
          const ev: CloseEvent = { type: "attempted", closePath, timestamp: nowIso() };
          const prev = s.session.closeEvents ?? [];
          if (!shouldAppendCloseEvent(prev, ev)) return s;
          const session = { ...s.session, closeEvents: [...prev, ev] };
          return { session: finalizeSessionInsights(session, s.signal, s.buyerState) };
        }),

      markCloseDeferred: (pathOverride) =>
        set((s) => {
          if (!s.session) return s;
          const closePath =
            pathOverride ?? s.session.closeAssessment?.recommendation?.path ?? "clarify_value";
          const ev: CloseEvent = { type: "deferred", closePath, timestamp: nowIso() };
          const prev = s.session.closeEvents ?? [];
          if (!shouldAppendCloseEvent(prev, ev)) return s;
          const session = { ...s.session, closeEvents: [...prev, ev] };
          return { session: finalizeSessionInsights(session, s.signal, s.buyerState) };
        }),

      markCloseBlocked: (pathOverride) =>
        set((s) => {
          if (!s.session) return s;
          const closePath =
            pathOverride ?? s.session.closeAssessment?.recommendation?.path ?? "clarify_value";
          const ev: CloseEvent = { type: "blocked", closePath, timestamp: nowIso() };
          const prev = s.session.closeEvents ?? [];
          if (!shouldAppendCloseEvent(prev, ev)) return s;
          const session = { ...s.session, closeEvents: [...prev, ev] };
          return { session: finalizeSessionInsights(session, s.signal, s.buyerState) };
        }),

      markCloseAdvanced: (pathOverride) =>
        set((s) => {
          if (!s.session) return s;
          const closePath =
            pathOverride ?? s.session.closeAssessment?.recommendation?.path ?? "clarify_value";
          const ev: CloseEvent = { type: "advanced", closePath, timestamp: nowIso() };
          const prev = s.session.closeEvents ?? [];
          if (!shouldAppendCloseEvent(prev, ev)) return s;
          const session = { ...s.session, closeEvents: [...prev, ev] };
          return { session: finalizeSessionInsights(session, s.signal, s.buyerState) };
        }),

      refreshDemoInsightLayer: () =>
        set((s) => {
          if (!s.session) return s;
          return { session: finalizeSessionInsights(s.session, s.signal, s.buyerState) };
        }),

      refreshPostDemoInsights: () =>
        set((s) => {
          if (!s.session) return s;
          return { session: finalizeSessionInsights(s.session, s.signal, s.buyerState) };
        }),

      resetCloseState: () =>
        set((s) =>
          s.session
            ? {
                session: {
                  ...s.session,
                  closeEvents: [],
                  closeAssessment: null,
                },
              }
            : s
        ),
    }),
    {
      name: PERSIST_KEY_SESSION,
      version: 14,
      storage: sessionPersistStorage,
      merge: (persistedState, currentState) => {
        if (persistedState == null || typeof persistedState !== "object") {
          return currentState;
        }
        const merged = { ...currentState, ...(persistedState as Partial<SessionStore>) };
        if (merged.signal == null) merged.signal = "yellow";
        if (merged.commandMode == null) merged.commandMode = false;
        if (merged.demoViewMode !== "public" && merged.demoViewMode !== "private") {
          merged.demoViewMode = "public";
        }
        if (merged.buyerState == null) merged.buyerState = "unknown";
        if (merged.coachingMomentum !== "up" && merged.coachingMomentum !== "flat" && merged.coachingMomentum !== "down") {
          merged.coachingMomentum = "flat";
        }
        if (merged.demoSlideType === undefined) merged.demoSlideType = null;
        return merged;
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error && process.env.NODE_ENV === "development") {
          console.warn("[axiom-session] persist rehydrate:", error);
        }
      },
      migrate: (persisted: unknown) => {
        try {
          const state = persisted as {
            session?: Session | null;
            sessionHistory?: SessionHistoryEntry[];
            pendingPresentationMaterial?: MaterialSummary | null;
          };
          if (!state.sessionHistory) state.sessionHistory = [];
          if (state.pendingPresentationMaterial === undefined) state.pendingPresentationMaterial = null;
          if (state?.session) {
            // Patch missing presentation entirely
            if (state.session.presentation == null) {
              state.session.presentation = createEmptyPresentation();
            } else {
              const p = state.session.presentation as Record<string, unknown>;
              if (p.pricingAccepted === undefined) p.pricingAccepted = false;
              if (p.interactiveProof == null) {
                p.interactiveProof = createInitialInteractiveDemoState();
              }
            }
            // Patch scalar and array fields
            const s = state.session as Record<string, unknown>;
            if (typeof s.repNotes !== "string") s.repNotes = "";
            if (!Array.isArray(s.coachingPrompts)) s.coachingPrompts = [];
            if (!Array.isArray(s.signals)) s.signals = [];
            if (!Array.isArray(s.objections)) s.objections = [];
            if (!Array.isArray(s.salesSteps)) s.salesSteps = [];
            // Patch V3→V4 additions
            if (!Array.isArray(s.constraints)) s.constraints = [];
            if (s.closeOutcome === undefined) s.closeOutcome = null;
            // V5: field snapshot on session (replaces door-observation textarea)
            if (!Array.isArray(s.fieldSnapshot)) s.fieldSnapshot = [];
            // V7: field engagement gate (Go / Soft-Go / Walk)
            if (s.fieldEngagementDecision === undefined) s.fieldEngagementDecision = null;
            // V8: guided demo close rail + CTAs + objection interrupt
            if (s.closeState === undefined) s.closeState = null;
            if (s.primaryCTA === undefined) s.primaryCTA = null;
            if (s.backupCTA === undefined) s.backupCTA = null;
            if (s.objectionTriggered === undefined) s.objectionTriggered = false;
            // V9: flow loop-back
            if (typeof s.flowMaxStep !== "number" || Number.isNaN(s.flowMaxStep)) {
              s.flowMaxStep = 1;
            }
            // V11: RFC 1 Proof Engine
            if (s.proofBrief === undefined) s.proofBrief = null;
            if (s.proofSequence === undefined) s.proofSequence = null;
            if (s.currentProofBlockId === undefined) s.currentProofBlockId = null;
            if (!Array.isArray(s.proofEvents)) s.proofEvents = [];
            if (s.proofAssessment === undefined) s.proofAssessment = null;
            // V12–V13: RFC 2 Close Engine
            if (!Array.isArray(s.closeEvents)) s.closeEvents = [];
            if (s.closeAssessment === undefined) s.closeAssessment = null;
            // V14: RFC 3 Method Engine
            if (s.activeMethodId === undefined || !isValidMethodId(s.activeMethodId)) {
              s.activeMethodId = DEFAULT_METHOD_ID;
            }
            if (s.methodStrategy === undefined) {
              s.methodStrategy = createInitialMethodStrategySnapshot();
            }
            // V13: `closeRecommendation` removed — embed into `closeAssessment.recommendation`
            if ("closeRecommendation" in s) {
              const cr = s.closeRecommendation as CloseRecommendation | null | undefined;
              let ca = s.closeAssessment as CloseAssessment | null | undefined;
              if (ca && typeof ca === "object") {
                if (!("recommendation" in ca) && cr) {
                  s.closeAssessment = { ...(ca as CloseAssessment), recommendation: cr };
                } else if (!("recommendation" in ca) && !cr) {
                  s.closeAssessment = null;
                }
                ca = s.closeAssessment as CloseAssessment | null | undefined;
                if (ca && !("timingQuality" in ca)) {
                  s.closeAssessment = { ...(ca as CloseAssessment), timingQuality: "unclear" };
                }
              }
              delete s.closeRecommendation;
            }
          }

          const root = persisted as {
            signal?: SignalColor;
            commandMode?: boolean;
          };
          if (root.signal !== "green" && root.signal !== "yellow" && root.signal !== "red") {
            root.signal = "yellow";
          }
          if (typeof root.commandMode !== "boolean") {
            root.commandMode = root.signal === "green";
          }

          const v10 = persisted as {
            demoViewMode?: DemoViewMode;
            buyerState?: BuyerState;
            coachingMomentum?: CoachingMomentum;
            demoSlideType?: string | null;
          };
          if (v10.demoViewMode !== "public" && v10.demoViewMode !== "private") {
            v10.demoViewMode = "public";
          }
          const validBuyer: BuyerState[] = [
            "unknown",
            "skeptical",
            "price_resistant",
            "distracted",
            "curious",
            "ready_to_buy",
            "needs_reassurance",
          ];
          if (!v10.buyerState || !validBuyer.includes(v10.buyerState)) {
            v10.buyerState = "unknown";
          }
          if (v10.coachingMomentum !== "up" && v10.coachingMomentum !== "flat" && v10.coachingMomentum !== "down") {
            v10.coachingMomentum = "flat";
          }
          if (v10.demoSlideType === undefined) v10.demoSlideType = null;
        } catch {
          /* Corrupt localStorage — let persist fall back to defaults */
        }
        return persisted;
      },
    }
  )
);
