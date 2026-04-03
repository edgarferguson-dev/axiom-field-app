"use client";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { cn } from "@/lib/utils/cn";

export type CommandModeBarProps = {
  /** When true, fixed bottom bar is visible (typically when deal signal is green). */
  visible: boolean;
  message?: string;
  onReinforceValue: () => void;
  onOpenAccount: () => void;
  className?: string;
};

/**
 * Closing focus — restrained emphasis: clear hierarchy, no theatrics.
 */
export function CommandModeBar({
  visible,
  message = "Buyer is ready. Stay in control of the close.",
  onReinforceValue,
  onOpenAccount,
  className,
}: CommandModeBarProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t-2 border-t-accent-dark/25 bg-surface/95 px-6 py-5 shadow-bar backdrop-blur-md sm:px-10",
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="min-w-0 space-y-1">
          <p className="ax-label">Closing focus</p>
          <p className="text-base font-medium leading-snug text-foreground">{message}</p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center gap-3 lg:justify-end">
          <SecondaryButton type="button" onClick={onReinforceValue} className="min-h-[44px] px-5">
            Reinforce value
          </SecondaryButton>
          <PrimaryButton type="button" onClick={onOpenAccount} className="min-h-[44px] min-w-[10rem] px-8">
            Open Account
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
