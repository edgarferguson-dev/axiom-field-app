import Link from "next/link";
import { AppShellV2 } from "@/components/layout/AppShellV2";
import { OfferTemplateSettings } from "@/components/settings/OfferTemplateSettings";

/** Linked from Command Center + AppShell; workspace prefs stay local-first. */
export default function SettingsPage() {
  return (
    <AppShellV2>
      <main className="mx-auto max-w-lg px-4 py-6 sm:py-8">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="mt-2 text-sm text-muted">
          Workspace preferences are stored in this browser (phone-first field use).
        </p>
        <OfferTemplateSettings />
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-medium text-accent underline underline-offset-2"
        >
          Back to home
        </Link>
      </main>
    </AppShellV2>
  );
}
