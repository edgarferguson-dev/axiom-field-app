"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type PhoneVariant = "neutral" | "warning" | "positive";

const ring: Record<PhoneVariant, string> = {
  neutral: "border-ink-600 shadow-[0_12px_40px_rgb(0_0_0/0.35)]",
  warning: "border-red-500/45 shadow-[0_12px_40px_rgb(127_29_29/0.25)]",
  positive: "border-teal-500/50 shadow-[0_12px_36px_rgb(20_184_166/0.22)]",
};

/**
 * Shared device chrome for beats 2–3 (missed vs fix). Content stays inside the inner screen.
 */
export function ProofRunPhoneFrame({
  variant,
  children,
  className,
  footer,
}: {
  variant: PhoneVariant;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[320px] rounded-[2.25rem] border-4 bg-ink-950 p-3 sm:p-4",
        ring[variant],
        className
      )}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Phone</span>
        <span className="h-1 w-12 rounded-full bg-white/10" aria-hidden />
      </div>
      {children}
      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
}
