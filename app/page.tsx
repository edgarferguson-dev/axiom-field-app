import { HomePageClient } from "@/components/home/HomePageClient";

/** Server entry for `/` — client UI lives in `HomePageClient` (hooks, store, router). */
export default function HomePage() {
  return <HomePageClient />;
}
