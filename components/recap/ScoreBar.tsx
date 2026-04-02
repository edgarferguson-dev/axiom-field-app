"use client";

import { cn } from "@/lib/utils/cn";

export function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 75 ? "bg-signal-green" : value >= 50 ? "bg-signal-yellow" : "bg-signal-red";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-foreground">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
