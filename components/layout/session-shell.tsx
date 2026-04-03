import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SessionShellProps = {
  children: ReactNode;
  className?: string;
};

/** Session canvas — default max width; routes may pass `max-w-none` for DaNI public deck. */
export function SessionShell({ children, className }: SessionShellProps) {
  return (
    <main className={cn("mx-auto max-w-6xl px-8 py-12", className)}>
      {children}
    </main>
  );
}
