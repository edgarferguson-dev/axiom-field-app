import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type AppShellProps = {
  children: ReactNode;
  className?: string;
};

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground",
        "selection:bg-accent/20 selection:text-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}
