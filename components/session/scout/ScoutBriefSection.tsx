import type { PreCallIntel } from "@/types/session";
import { PreCallBriefPanel } from "@/components/field-read/PreCallBriefPanel";

type ScoutBriefSectionProps = {
  intel: PreCallIntel;
  onContinue: () => void;
  onNewScout: () => void;
};

export function ScoutBriefSection({ intel, onContinue, onNewScout }: ScoutBriefSectionProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Brief locked in
          </h2>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Walk-in lines below — then open live demo for proof.
          </p>
        </div>
        <button
          type="button"
          onClick={onNewScout}
          className="shrink-0 self-start rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted transition hover:border-accent/40 hover:text-foreground sm:self-center sm:px-4 sm:text-sm"
        >
          New scout
        </button>
      </div>
      <PreCallBriefPanel intel={intel} onContinue={onContinue} />
    </div>
  );
}
