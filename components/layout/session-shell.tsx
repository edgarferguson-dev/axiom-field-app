import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SessionShellProps = {
  children: ReactNode;
  className?: string;
};

export function SessionShell({ children, className }: SessionShellProps) {
  return (
    <main className={cn("mx-auto max-w-7xl px-4 py-6", className)}>
      {children}
    </main>
  );
}
