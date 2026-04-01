import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type PublicPrivateSplitProps = {
  publicPane: ReactNode;
  privatePane: ReactNode;
  /** Lighter buyer pane — pairs with `PresentationEngine` `variant="continuous"` */
  surface?: "default" | "continuous";
};

export function PublicPrivateSplit({
  publicPane,
  privatePane,
  surface = "default",
}: PublicPrivateSplitProps) {
  const publicSectionClass =
    surface === "continuous"
      ? "relative min-h-[560px] overflow-hidden rounded-2xl border border-border/35 bg-gradient-to-br from-card/50 via-background/95 to-background p-5 shadow-[0_32px_120px_-48px_rgba(0,0,0,0.55)] sm:p-8"
      : "min-h-[560px] rounded-2xl border border-border bg-card p-6 shadow-soft";

  const asideClass = cn(
    "h-fit lg:sticky lg:top-6",
    surface === "continuous"
      ? "rounded-xl border border-border/25 bg-background/35 p-3 shadow-none backdrop-blur-sm"
      : "rounded-2xl border border-border bg-card p-4 shadow-soft"
  );

  return (
    <div
      className={cn(
        "grid gap-5 lg:gap-6",
        surface === "continuous" ? "lg:grid-cols-[minmax(0,1fr)_280px]" : "lg:grid-cols-[minmax(0,1fr)_320px]"
      )}
    >
      <section className={publicSectionClass}>{publicPane}</section>

      <aside className={asideClass}>{privatePane}</aside>
    </div>
  );
}
