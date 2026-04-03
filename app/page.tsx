import type { Metadata } from "next";
import { AppShellV2 } from "@/components/layout/AppShellV2";
import { HomePageClient } from "@/components/home/HomePageClient";

export const metadata: Metadata = {
  title: "Axiom Field",
  description: "Field sales execution — scout, proof, and close without a software tour.",
};

/** Server entry for `/` — shell + client UI (hooks, store, router). */
export default function HomePage() {
  return (
    <AppShellV2>
      <HomePageClient />
    </AppShellV2>
  );
}
