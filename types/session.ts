// Core phase flow: pre-call → live-demo → debrief
export type SessionPhase = "pre-call" | "live-demo" | "debrief";

export type RiskBand = "high" | "medium" | "low";

export type SignalColor = "green" | "yellow" | "red";

// --- Input shapes ---

export type BusinessProfile = {
  name: string;
  type: string;
  currentSystem: string; // e.g., "manual follow-up", "no CRM", "basic email"
  leadSource: string;    // e.g., "walk-ins", "Google", "referrals"
  notes: string;         // rep's freeform observations at the door
};

// --- AI output shapes ---

export type PreCallIntel = {
  painPattern: string;           // Specific pain point narrative (2-3 sentences)
  riskBand: RiskBand;            // Urgency classification
  missedValueEstimate: string;   // e.g., "$3,000–8,000/month"
  keyOpportunities: string[];    // 3 talking points
  recommendedAngle: string;      // Opening line for this rep to use
};

export type CoachingPrompt = {
  id: string;
  signal: SignalColor;   // Engagement level indicator
  audioCue: string;      // What to say right now
  nextMove: string;      // Tactical next action
  buySignal?: string;    // Positive signal detected, if any
  timestamp: number;
};

export type PerformanceScore = {
  overall: number; // 0–100
  breakdown: {
    discovery: number;
    positioning: number;
    objectionHandling: number;
    closing: number;
  };
  strengths: string[];
  improvements: string[];
  summary: string;
};

// --- Session aggregate ---

export type Session = {
  id: string;
  repName: string;
  createdAt: number;
  phase: SessionPhase;
  business: BusinessProfile | null;
  preCallIntel: PreCallIntel | null;
  coachingPrompts: CoachingPrompt[];
  repNotes: string;
  startedAt: number | null;
  completedAt: number | null;
  score: PerformanceScore | null;
};
