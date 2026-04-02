import { AppShellV2 } from "@/components/layout/AppShellV2";
import { HomePageClient } from "@/components/home/HomePageClient";

/** Server entry for `/` — shell + client UI (hooks, store, router). */
export default function HomePage() {
  return (
    <AppShellV2>
      <HomePageClient />
    </AppShellV2>
  );
}
