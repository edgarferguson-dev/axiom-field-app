import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function SecondaryButton({ className, children, type = "button", ...rest }: SecondaryButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "rounded-lg border border-border bg-surface px-5 py-2 text-sm text-foreground transition hover:bg-border/30 disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
