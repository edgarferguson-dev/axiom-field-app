import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

/**
 * Navy primary — **only** for close, commitment, and final-step actions.
 * Do not use for navigation or secondary flows.
 */
export function PrimaryButton({ className, children, type = "button", ...rest }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
