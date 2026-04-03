import type { ReactNode } from "react";

/**
 * @deprecated DaNI is single-screen (Public / Private). This stacks panes vertically — no side-by-side split.
 */
export function PublicPrivateSplit({
  publicPane,
  privatePane,
}: {
  publicPane: ReactNode;
  privatePane: ReactNode;
}) {
  return (
    <div className="space-y-10">
      <section className="min-w-0">{publicPane}</section>
      <section className="min-w-0">{privatePane}</section>
    </div>
  );
}
