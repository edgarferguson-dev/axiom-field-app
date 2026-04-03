import { cn } from "@/lib/utils/cn";
import type { SignalColor } from "@/types/session";

const map: Record<SignalColor, string> = {
  green: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80",
  yellow: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80",
  red: "bg-red-50 text-red-800 ring-1 ring-red-200/80",
};

const label: Record<SignalColor, string> = {
  green: "BUY SIGNAL",
  yellow: "NEUTRAL",
  red: "RISK",
};

export type SignalBadgeProps = {
  type: SignalColor;
  className?: string;
};

export function SignalBadge({ type, className }: SignalBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        map[type],
        className
      )}
    >
      {label[type]}
    </div>
  );
}
