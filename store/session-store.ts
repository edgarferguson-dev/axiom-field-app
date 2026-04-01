import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Session,
  SessionPhase,
  BusinessProfile,
  PreCallIntel,
  CoachingPrompt,
  PerformanceScore,
  ObjectionType,
  SalesStep,
  Signal,
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

type SessionStore = {
  session: Session | null;
  disposition: DispositionResult | null;

  initSession: (id: string, repName: string) => void;
  setPhase: (phase: SessionPhase) => void;
  setBusiness: (business: BusinessProfile) => void;
  setPreCallIntel: (intel: PreCallIntel) => void;
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
  startSession: (repName: string) => string;
  reset: () => void;

  ensurePresentationSlides: () => void;
  applyPresentationMaterial: (summary: MaterialSummary) => void;
  setPresentationPricingTierId: (tierId: string | null) => void;
  setPresentationPricingResponse: (
    response: "accept" | "hesitate" | "reject" | null
  ) => void;
  setPresentationOpenAccountStarted: (started: boolean) => void;
  dispatchInteractiveProofEvent: (event: InteractiveDemoEvent) => void;
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      session: null,
      disposition: null,

      initSession: (id, repName) =>
        set({
          session: {
            id,
            repName,
            createdAt: Date.now(),
            phase: "pre-call",
            business: null,
            preCallIntel: null,
            coachingPrompts: [],
            repNotes: "",
            startedAt: null,
            completedAt: null,
            score: null,
            presentation: createEmptyPresentation(),
            signals: [],
            objections: [],
            salesSteps: [],
          },
          disposition: null,
        }),

      startSession: (repName) => {
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `ax-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
        set({
          session: {
            id,
            repName,
            createdAt: Date.now(),
            phase: "field-read",
            business: null,
            preCallIntel: null,
            coachingPrompts: [],
            repNotes: "",
            startedAt: null,
            completedAt: null,
            score: null,
            presentation: createEmptyPresentation(),
            signals: [],
            objections: [],
            salesSteps: [],
          },
          disposition: null,
        });
        return id;
      },

      setPhase: (phase) =>
        set((s) => (s.session ? { session: { ...s.session, phase } } : s)),

      setBusiness: (business) =>
        set((s) => (s.session ? { session: { ...s.session, business } } : s)),

      setPreCallIntel: (preCallIntel) =>
        set((s) => (s.session ? { session: { ...s.session, preCallIntel } } : s)),

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

      clearSession: () => set({ session: null, disposition: null }),

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

      reset: () => set({ session: null, disposition: null }),

      ensurePresentationSlides: () =>
        set((s) => {
          if (!s.session?.business) return s;
          const prev = s.session.presentation ?? createEmptyPresentation();
          if (prev.generatedSlides.length > 0) return s;
          const strategy = buildStrategyPackage(
            s.session.business,
            s.session.preCallIntel,
            prev.materialSummary
          );
          const generatedSlides = generatePresentationSlides(
            s.session.business,
            strategy,
            s.session.preCallIntel
          );
          return {
            session: {
              ...s.session,
              presentation: {
                ...prev,
                strategyPackage: strategy,
                generatedSlides,
              },
            },
          };
        }),

      applyPresentationMaterial: (summary) =>
        set((s) => {
          if (!s.session?.business) return s;
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
              presentation: {
                ...empty,
                materialSummary: summary,
                strategyPackage: strategy,
                generatedSlides,
              },
            },
          };
        }),

      setPresentationPricingTierId: (tierId) =>
        set((s) => {
          if (!s.session) return s;
          const pres = s.session.presentation;
          return {
            session: {
              ...s.session,
              presentation: { ...pres, pricingTierId: tierId },
            },
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
            session: {
              ...s.session,
              presentation: { ...pres, openAccountStarted },
            },
          };
        }),

      dispatchInteractiveProofEvent: (event) =>
        set((s) => {
          if (!s.session) return s;
          const pres = s.session.presentation ?? createEmptyPresentation();
          const interactiveProof = reduceInteractiveDemo(pres.interactiveProof, event);
          return {
            session: {
              ...s.session,
              presentation: { ...pres, interactiveProof },
            },
          };
        }),
    }),
    {
      name: "axiom-session",
      version: 2,
      migrate: (persisted: unknown, _version: number) => {
        const state = persisted as { session?: Session | null };
        if (state?.session) {
          // Patch missing presentation entirely
          if (state.session.presentation == null) {
            state.session.presentation = createEmptyPresentation();
          } else {
            const p = state.session.presentation as Record<string, unknown>;
            // Patch missing pricingAccepted flag
            if (p.pricingAccepted === undefined) p.pricingAccepted = false;
            // Patch missing interactiveProof (added after initial release)
            if (p.interactiveProof == null) {
              p.interactiveProof = createInitialInteractiveDemoState();
            }
          }
          // Patch missing array fields from older session formats
          const s = state.session as Record<string, unknown>;
          if (!Array.isArray(s.coachingPrompts)) s.coachingPrompts = [];
          if (!Array.isArray(s.signals)) s.signals = [];
          if (!Array.isArray(s.objections)) s.objections = [];
          if (!Array.isArray(s.salesSteps)) s.salesSteps = [];
        }
        return persisted;
      },
    }
  )
);
