import Link from "next/link";
import { AppShellV2 } from "@/components/layout/AppShellV2";

/** Linked from Command Center + AppShell; workspace prefs stay local-first. */
export default function SettingsPage() {
  return (
    <AppShellV2>
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="mt-2 text-sm text-muted">
          Workspace preferences are stored in this browser. More controls will appear here as the product
          grows.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-accent underline underline-offset-2"
        >
          Back to home
        </Link>
      </main>
    </AppShellV2>
  );
}
