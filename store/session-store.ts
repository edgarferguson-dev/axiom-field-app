import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Session,
  SessionPhase,
  BusinessProfile,
  PreCallIntel,
  CoachingPrompt,
  PerformanceScore,
} from "@/types/session";

type SessionStore = {
  session: Session | null;
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
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      session: null,

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
          },
        }),

      setPhase: (phase) =>
        set((s) =>
          s.session ? { session: { ...s.session, phase } } : s
        ),

      setBusiness: (business) =>
        set((s) =>
          s.session ? { session: { ...s.session, business } } : s
        ),

      setPreCallIntel: (preCallIntel) =>
        set((s) =>
          s.session ? { session: { ...s.session, preCallIntel } } : s
        ),

      addCoachingPrompt: (prompt) =>
        set((s) =>
          s.session
            ? {
                session: {
                  ...s.session,
                  coachingPrompts: [...s.session.coachingPrompts, prompt],
                },
              }
            : s
        ),

      setRepNotes: (repNotes) =>
        set((s) =>
          s.session ? { session: { ...s.session, repNotes } } : s
        ),

      setScore: (score) =>
        set((s) =>
          s.session ? { session: { ...s.session, score } } : s
        ),

      markStarted: () =>
        set((s) =>
          s.session
            ? { session: { ...s.session, startedAt: Date.now() } }
            : s
        ),

      markCompleted: () =>
        set((s) =>
          s.session
            ? { session: { ...s.session, completedAt: Date.now() } }
            : s
        ),

      clearSession: () => set({ session: null }),
    }),
    { name: "axiom-session" }
  )
);
