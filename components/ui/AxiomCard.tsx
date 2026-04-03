import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type AxiomCardProps = {
  children: ReactNode;
  className?: string;
};

/** Surface card — white panel, soft shadow, token border. */
export function AxiomCard({ children, className }: AxiomCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-6 shadow-soft",
        className
      )}
    >
      {children}
    </div>
  );
}
