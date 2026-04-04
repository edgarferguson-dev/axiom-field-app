"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "missed" | "fix";

export function DaniPhoneSteps({
  variant,
  businessName,
  className,
}: {
  variant: Variant;
  businessName: string;
  className?: string;
}) {
  const [step, setStep] = useState(0);

  const missedSteps = [
    { t: "Incoming call", sub: "Owner is with a client" },
    { t: "No pickup", sub: "Voicemail or silence" },
    { t: "Caller moves on", sub: "They dial the next shop" },
    { t: "Revenue walks", sub: "That slot never comes back" },
  ];

  const fixSteps = [
    { t: "Missed call", sub: "Still busy on the floor" },
    { t: "Instant text-back", sub: `Hi — it's ${businessName || "us"}. Want a time?` },
    { t: "Pick a slot", sub: "Self-serve booking link" },
    { t: "Confirmed ✓", sub: "Calendar locks without extra staff" },
  ];

  const steps = variant === "missed" ? missedSteps : fixSteps;
  const cur = Math.min(step, steps.length - 1);

  const advance = useCallback(() => {
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }, [steps.length]);

  const isMissedLoss = variant === "missed" && cur === 3;
  const isFixWin = variant === "fix" && cur === 3;

  return (
    <button
      type="button"
      onClick={advance}
      className={cn(
        "relative mx-auto w-full max-w-[280px] rounded-[2rem] border-4 p-4 text-left shadow-xl transition",
        variant === "missed"
          ? "border-red-500/40 bg-[#0f0f0f]"
          : "border-teal-500/50 bg-[#0f0f0f] shadow-[0_0_32px_rgba(20,184,166,0.25)]",
        isMissedLoss && "animate-pulse border-red-500/80",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Phone</span>
        <span className="text-[10px] text-white/40">
          Tap · {cur + 1}/{steps.length}
        </span>
      </div>
      {variant === "missed" && cur === 0 ? (
        <span
          className="absolute right-6 top-14 h-16 w-16 rounded-full border-2 border-red-400/60"
          style={{ animation: "pulse 1.5s ease-in-out infinite" }}
          aria-hidden
        />
      ) : null}
      <div className={cn("min-h-[120px] rounded-2xl bg-black/40 p-4", isFixWin && "ring-2 ring-teal-400/60")}>
        <p className="text-lg font-bold text-white">{steps[cur]!.t}</p>
        <p className="mt-2 text-sm text-white/70">{steps[cur]!.sub}</p>
        {isFixWin ? (
          <p className="mt-4 text-center text-2xl text-teal-400" aria-hidden>
            ✓
          </p>
        ) : null}
      </div>
      <p className="mt-3 text-center text-[10px] text-white/40">Tap phone to advance step</p>
    </button>
  );
}
