"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SessionShell } from "@/components/layout/session-shell";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";

type SessionStageShellProps = {
  sessionId: string;
  children: ReactNode;
  className?: string;
};

/**
 * Shared session route wrapper: consistent shell + no-session / URL mismatch guards.
 * Does not own stage product logic — only structure.
 */
export function SessionStageShell({ sessionId, children, className }: SessionStageShellProps) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);

  const guardClass = "mx-auto max-w-3xl space-y-3 text-sm text-muted";

  if (!session) {
    return (
      <SessionShell className={className}>
        <div className={guardClass}>
          <p>No active session found.</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-accent underline underline-offset-2"
          >
            Return home to start a session
          </button>
        </div>
      </SessionShell>
    );
  }

  if (session.id !== sessionId) {
    return (
      <SessionShell className={className}>
        <div className={guardClass}>
          <p>This URL does not match the loaded session.</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-accent underline underline-offset-2"
          >
            Go home
          </button>
        </div>
      </SessionShell>
    );
  }

  return <SessionShell className={cn(className)}>{children}</SessionShell>;
}
