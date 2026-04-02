"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Constraints are captured on the scout page (`field-read`).
 * This route remains for old bookmarks / deep links and forwards to the demo.
 */
export default function ConstraintsRedirectPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/session/${params.sessionId}/demo`);
  }, [router, params.sessionId]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center text-sm text-muted">
      <p className="text-foreground">Moving you to the live demo…</p>
      <p className="text-xs">Constraints are set on the Scout step.</p>
    </div>
  );
}
