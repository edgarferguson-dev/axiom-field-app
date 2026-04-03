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
  };
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

      setPreCallIntel: (preCallIntel) =>
        set((s) => (s.session ? { session: { ...s.session, preCallIntel } } : s)),

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
    }),
    {
      name: PERSIST_KEY_SESSION,
      version: 10,
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
