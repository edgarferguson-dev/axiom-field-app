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
import type { DispositionResult } from "@/types/disposition";

type SessionStore = {
  session: Session | null;
  disposition: DispositionResult | null;

  // Existing actions
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

  // V2B actions
  addObjection: (objection: ObjectionType) => void;
  addSalesStep: (step: SalesStep) => void;
  addSignal: (signal: Signal) => void;
  setDisposition: (disposition: DispositionResult) => void;
  startSession: (business?: BusinessProfile) => void;
  reset: () => void;
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
            signals: [],
            objections: [],
            salesSteps: [],
          },
          disposition: null,
        }),

      // V2B: start a session without a repName (demo flow)
      startSession: (business) =>
        set({
          session: {
            id:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${Date.now()}`,
            repName: "",
            createdAt: Date.now(),
            phase: business ? "field-read" : "intake",
            business: business ?? null,
            preCallIntel: null,
            coachingPrompts: [],
            repNotes: "",
            startedAt: Date.now(),
            completedAt: null,
            score: null,
            signals: [],
            objections: [],
            salesSteps: [],
          },
          disposition: null,
        }),

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

      // V2B actions
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
    }),
    { name: "axiom-session" }
  )
);
