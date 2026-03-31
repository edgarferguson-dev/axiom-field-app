import { ReactNode } from "react";

type PublicPrivateSplitProps = {
  publicPane: ReactNode;
  privatePane: ReactNode;
};

export function PublicPrivateSplit({
  publicPane,
  privatePane,
}: PublicPrivateSplitProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-h-[560px] rounded-2xl border border-border bg-card p-6 shadow-soft">
        {publicPane}
      </section>

      <aside className="h-fit rounded-2xl border border-border bg-card p-4 shadow-soft lg:sticky lg:top-6">
        {privatePane}
      </aside>
    </div>
  );
}
