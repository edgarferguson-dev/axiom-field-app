"use client";

import { DemoPrivateStage } from "@/components/demo/DemoPrivateStage";
import { DemoCoachingPanel } from "@/components/demo/DemoCoachingPanel";
import type { CoachingPrompt } from "@/types/session";
import type { PreCallIntel, FieldEngagementDecision } from "@/types/session";

export type PrivateScreenProps = {
  started: boolean;
  intel: PreCallIntel | null | undefined;
  fieldEngagementDecision?: FieldEngagementDecision | null;
  activePrompt: CoachingPrompt | null;
  loadingCoach: boolean;
  error: string | null;
  onGetCoaching: () => void;
  onJumpToPricing: () => void;
  repNotes: string;
  onRepNotesChange: (value: string) => void;
  coachingPromptCount: number;
  onEndSession: () => void;
  closingFocus?: boolean;
};

/**
 * DaNI rep-only — DemoPrivateStage (coaching rail) + close tools. No split with public.
 */
export function PrivateScreen(props: PrivateScreenProps) {
  return (
    <div className="mx-auto w-full max-w-lg pb-8">
      <DemoPrivateStage />
      <div className="mt-6 border-t border-border/50 pt-5">
        <DemoCoachingPanel {...props} variant="dani" hideTopSignalBlock />
      </div>
    </div>
  );
}
